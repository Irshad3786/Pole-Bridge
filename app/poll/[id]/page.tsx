'use client'

import React, { useState, useEffect, useRef } from 'react'
import Logo from '@/components/Logo'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

interface Vote {
  optionIndex: number
  voterName: string
  voterEmail: string
  votedAt: string
}

interface Question {
  question: string
  options: string[]
  votes: Vote[]
}

interface Poll {
  _id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
}

export default function PollPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const pollId = params?.id as string
  const socketRef = useRef<Socket | null>(null)
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingInProgress, setVotingInProgress] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [hasVotedQuestions, setHasVotedQuestions] = useState<Set<number>>(new Set())
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isPollingMode, setIsPollingMode] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPoll = async () => {
    setError(null)
    
    try {
      console.log('📡 Fetching poll with ID:', pollId)
      const response = await fetch(`/api/polls/${pollId}`)
      const data = await response.json()

      console.log('✅ Poll API response:', response.status)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch poll')
      }

      setPoll(data.poll)
      setIsLoading(false)
    } catch (err: any) {
      console.error('❌ Error fetching poll:', err)
      setError(err.message || 'Failed to load poll')
      setIsLoading(false)
    }
  }

  // Initial poll fetch
  useEffect(() => {
    console.log('🔄 Poll ID from params:', pollId)
    if (pollId) {
      setIsLoading(true)
      fetchPoll()
    } else {
      setError('Invalid poll link')
      setIsLoading(false)
    }
  }, [pollId])

  // Socket.IO setup with intelligent fallback to polling
  useEffect(() => {
    if (!pollId) {
      console.log('⚠️ No pollId, skipping real-time setup')
      return
    }

    console.log('🔌 Setting up real-time updates for poll:', pollId)

    // Socket URL - try to connect to Socket.IO server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
    
    if (!socketUrl) {
      console.log('⚠️ NEXT_PUBLIC_SOCKET_URL not set, using polling mode')
      setIsPollingMode(true)
      startPolling()
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    }

    console.log('🌐 Attempting Socket.IO connection to:', socketUrl)

    const socket = io(socketUrl, {
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      timeout: 10000
    })

    let connectionTimeout: NodeJS.Timeout

    // Handle connection
    const onConnect = () => {
      console.log('✅ Socket connected, ID:', socket.id)
      setIsSocketConnected(true)
      setIsPollingMode(false)
      socket.emit('join-poll', pollId)
      console.log('📋 Joined poll room:', pollId)
      
      // Stop polling if it was started
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        console.log('🛑 Stopped polling (Socket.IO connected)')
      }
    }

    // Handle votes from other clients
    const onVoteUpdate = async (data: any) => {
      console.log('🗳️ Vote-update event received:', data)
      try {
        const response = await fetch(`/api/polls/${pollId}`)
        const result = await response.json()
        if (response.ok && result.poll) {
          console.log('🔄 Poll refreshed from socket event')
          setPoll(result.poll)
        }
      } catch (err) {
        console.error('Error fetching poll after vote:', err)
      }
    }

    const onError = (error: any) => {
      console.error('Socket error:', error)
    }

    const onConnectError = (error: any) => {
      console.error('Socket connection error:', error)
      setIsSocketConnected(false)
    }

    const onDisconnect = (reason: any) => {
      console.log('Socket disconnected:', reason)
      setIsSocketConnected(false)
    }

    // Attach listeners
    socket.on('connect', onConnect)
    socket.on('vote-update', onVoteUpdate)
    socket.on('error', onError)
    socket.on('connect_error', onConnectError)
    socket.on('disconnect', onDisconnect)

    socketRef.current = socket

    // Fallback: If socket doesn't connect within 10 seconds, start polling
    connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        console.log('⏰ Socket.IO connection timeout - falling back to polling mode')
        console.log('💡 Deploy Socket.IO server separately for real-time updates')
        setIsPollingMode(true)
        startPolling()
      }
    }, 10000)

    // Cleanup
    return () => {
      clearTimeout(connectionTimeout)
      console.log('🧹 Cleaning up socket for poll:', pollId)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      socket.emit('leave-poll', pollId)
      socket.off('connect', onConnect)
      socket.off('vote-update', onVoteUpdate)
      socket.off('error', onError)
      socket.off('connect_error', onConnectError)
      socket.off('disconnect', onDisconnect)
      socket.disconnect()
    }
  }, [pollId])

  // HTTP Polling fallback function
  const startPolling = () => {
    if (pollingIntervalRef.current) return
    
    console.log('🔄 Starting HTTP polling mode (updates every 3 seconds)')
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/polls/${pollId}`)
        const result = await response.json()
        if (response.ok && result.poll) {
          setPoll(result.poll)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)
  }

  const handleVote = async (questionIndex: number, optionIndex: number) => {
    // Check if user is logged in
    if (!session) {
      setShowLoginPrompt(true)
      return
    }

    // Prevent double voting attempts
    if (votingInProgress) {
      console.log('⚠️ Vote already in progress, ignoring click')
      return
    }

    // Check if user has already voted on this question (check both state and hasVotedQuestions set)
    if (poll && poll.questions[questionIndex]) {
      const hasVoted = hasVotedQuestions.has(questionIndex) || 
                       poll.questions[questionIndex].votes.some(
                         vote => vote.voterEmail === session.user?.email
                       )
      
      if (hasVoted) {
        alert('You have already voted on this question!')
        return
      }
    }

    setVotingInProgress(true)
    console.log(`🗳️ Submitting vote: Q${questionIndex}, Option ${optionIndex}`)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId,
          questionIndex,
          optionIndex
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record vote')
      }

      console.log('✅ Vote recorded successfully')
      
      // Optimistically add vote to local state immediately
      setPoll(prevPoll => {
        if (!prevPoll) return prevPoll
        
        const updatedPoll = { ...prevPoll }
        const question = updatedPoll.questions[questionIndex]
        
        if (question && session?.user) {
          question.votes.push({
            optionIndex,
            voterName: session.user.name || 'Anonymous',
            voterEmail: session.user.email || '',
            votedAt: new Date().toISOString()
          })
          
          // Track that user has voted on this question
          setHasVotedQuestions(prev => new Set(prev).add(questionIndex))
        }
        
        return updatedPoll
      })
      
    } catch (err: any) {
      alert(err.message || 'Failed to record vote')
      console.error('Error voting:', err)
    } finally {
      // Small delay to prevent double-clicks and allow Socket.IO update
      setTimeout(() => {
        setVotingInProgress(false)
        console.log('🔓 Voting unlocked')
      }, 1000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <nav className="bg-white shadow-md border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Logo />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 mt-4 text-lg">Loading poll...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <nav className="bg-white shadow-md border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Login
              </button>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Poll Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The poll you are looking for does not exist or has been removed.'}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fadeIn">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h2>
              <p className="text-gray-600 mb-6">
                You need to login to vote on this poll. This ensures fair voting and prevents multiple votes from the same person.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/login?callbackUrl=/poll/${pollId}`)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Login to Vote
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center gap-3">
              {/* Connection Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${
                  isSocketConnected ? 'bg-green-500' : 
                  isPollingMode ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span>
                  {isSocketConnected ? 'Live' : isPollingMode ? 'Polling' : 'Connecting...'}
                </span>
              </div>
              
              {session ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {session.user?.name}
                  </span>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push(`/login?callbackUrl=/poll/${pollId}`)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                >
                  Login to Vote
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Poll Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {poll.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">{poll.description}</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              Created on {new Date(poll.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {poll.questions.map((question, qIndex) => {
              const totalVotes = question.votes.length

              return (
                <div key={qIndex} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6">
                  <h2 className="font-bold text-gray-800 mb-4 flex items-start gap-2 text-lg sm:text-xl">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
                      {qIndex + 1}
                    </span>
                    <span className="flex-1">{question.question}</span>
                  </h2>
                  
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => {
                      const optionVotes = question.votes.filter(v => v.optionIndex === oIndex)
                      const voteCount = optionVotes.length
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
                      const userVoted = question.votes.some(v => v.voterEmail === session?.user?.email)
                      const userVotedThisOption = optionVotes.some(v => v.voterEmail === session?.user?.email)

                      return (
                        <div key={oIndex} className="bg-white rounded-lg p-4 space-y-2">
                          <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
                            <button
                              onClick={() => handleVote(qIndex, oIndex)}
                              disabled={votingInProgress || userVoted}
                              className={`flex items-center gap-3 p-2 rounded transition-colors w-full sm:w-auto relative ${
                                userVotedThisOption 
                                  ? 'bg-purple-100 border-2 border-purple-500' 
                                  : userVoted 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-purple-50 cursor-pointer'
                              } ${votingInProgress ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                              {votingInProgress && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                                  <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </div>
                              )}
                              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                userVotedThisOption 
                                  ? 'border-purple-500 bg-purple-500' 
                                  : 'border-purple-500'
                              }`}>
                                {userVotedThisOption && (
                                  <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium text-gray-700 text-left">{option}</span>
                              {userVotedThisOption && (
                                <span className="text-xs text-purple-600 font-semibold ml-auto">Your vote</span>
                              )}
                            </button>
                            <span className="text-sm text-gray-600 font-semibold whitespace-nowrap ml-10 sm:ml-0">
                              {voteCount} {voteCount === 1 ? 'vote' : 'votes'} ({percentage}%)
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-900 h-2.5 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          
                          {/* Voter Names */}
                          {optionVotes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {optionVotes.map((vote, vIdx) => (
                                <span
                                  key={vIdx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"
                                >
                                  {vote.voterName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-purple-200 text-sm text-gray-600 font-semibold">
                    Total votes: {totalVotes}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Create Your Own Poll</h3>
          <p className="text-purple-100 mb-4 text-sm sm:text-base">Join Poll-Bridge and start creating polls in seconds</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 px-4 text-center mt-12">
        <p className="text-sm">&copy; 2026 Poll-Bridge. All rights reserved.</p>
      </footer>
    </div>
  )
}
