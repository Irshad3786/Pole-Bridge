'use client'

import React, { useState, useEffect, useRef } from 'react'
import Logo from '@/components/Logo'
import { signOut } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

interface Option {
  id: number
  text: string
}

interface Vote {
  optionIndex: number
  voterName: string
  voterEmail: string
  votedAt: string
}

interface SavedQuestion {
  question: string
  options: string[]
  votes: Vote[]
}

interface SavedPoll {
  _id: string
  title: string
  description: string
  questions: SavedQuestion[]
  createdAt: string
  updatedAt: string
}

interface GeneratedPoll {
  title: string
  description: string
  questions: {
    question: string
    options: string[]
  }[]
}

function Dashboard() {
  const [isAiMode, setIsAiMode] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [question, setQuestion] = useState('')
  const [showPolls, setShowPolls] = useState(false)
  const [options, setOptions] = useState<Option[]>([
    { id: 1, text: '' },
    { id: 2, text: '' }
  ])
  const [nextOptionId, setNextOptionId] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPoll, setGeneratedPoll] = useState<GeneratedPoll | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedPolls, setSavedPolls] = useState<SavedPoll[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPolls, setIsLoadingPolls] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copiedPollId, setCopiedPollId] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isPollingMode, setIsPollingMode] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch polls on component mount and when showPolls is toggled
  useEffect(() => {
    if (showPolls) {
      fetchPolls()
    }
  }, [showPolls])

  // Socket.IO setup with intelligent fallback to polling
  useEffect(() => {
    console.log('🔌 Setting up real-time updates on dashboard...')

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

    const socketInstance = io(socketUrl, {
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      timeout: 10000
    })

    let connectionTimeout: NodeJS.Timeout

    socketInstance.on('connect', () => {
      console.log('✅ Dashboard Socket.IO connected:', socketInstance.id)
      setIsSocketConnected(true)
      setIsPollingMode(false)
      
      // Stop polling if it was started
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        console.log('🛑 Stopped polling (Socket.IO connected)')
      }
      
      fetchPolls()
    })

    socketInstance.on('vote-update', async (data: any) => {
      console.log('🗳️ Dashboard received vote-update:', data)
      await fetchPolls()
    })

    socketInstance.on('connect_error', (error: any) => {
      console.error('⚠️ Dashboard Socket.IO connection error:', error)
      setIsSocketConnected(false)
    })

    socketInstance.on('disconnect', (reason: any) => {
      console.log('❌ Dashboard Socket.IO disconnected:', reason)
      setIsSocketConnected(false)
    })

    socketRef.current = socketInstance

    // Fallback: If socket doesn't connect within 10 seconds, start polling
    connectionTimeout = setTimeout(() => {
      if (!socketInstance.connected) {
        console.log('⏰ Socket.IO connection timeout - falling back to polling mode')
        console.log('💡 Deploy Socket.IO server separately for real-time updates')
        setIsPollingMode(true)
        startPolling()
      }
    }, 10000)

    return () => {
      clearTimeout(connectionTimeout)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      if (socketInstance) {
        savedPolls.forEach(poll => {
          socketInstance.emit('leave-poll', poll._id)
        })
        socketInstance.disconnect()
      }
    }
  }, [])

  // HTTP Polling fallback function
  const startPolling = () => {
    if (pollingIntervalRef.current) return
    
    console.log('🔄 Starting HTTP polling mode (updates every 5 seconds)')
    pollingIntervalRef.current = setInterval(async () => {
      try {
        await fetchPolls()
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)
  }

  // Update socket poll rooms when savedPolls changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && savedPolls.length > 0) {
      console.log('📊 Updating socket rooms for', savedPolls.length, 'polls')
      savedPolls.forEach(poll => {
        socketRef.current?.emit('join-poll', poll._id)
        console.log('✅ Joined poll room:', poll._id)
      })
    }
  }, [savedPolls])

  const copyPollLink = async (pollId: string) => {
    const pollUrl = `${window.location.origin}/poll/${pollId}`
    
    console.log('Copying poll URL:', pollUrl)
    console.log('Poll ID:', pollId)
    
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopiedPollId(pollId)
      
      // Show alert with the copied link
      alert(`Link copied!\n\n${pollUrl}\n\nShare this link with others to collect votes.`)
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopiedPollId(null), 3000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      
      // Fallback: show the link in an alert if clipboard fails
      alert(`Copy this link:\n\n${pollUrl}`)
    }
  }

  const fetchPolls = async () => {
    setIsLoadingPolls(true)
    try {
      const response = await fetch('/api/polls')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch polls')
      }

      setSavedPolls(data.polls)
    } catch (err: any) {
      console.error('Error fetching polls:', err)
      setError(err.message || 'Failed to fetch polls')
    } finally {
      setIsLoadingPolls(false)
    }
  }

  const savePoll = async (pollData: GeneratedPoll) => {
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save poll')
      }

      setSaveSuccess(true)
      setGeneratedPoll(null)
      setAiPrompt('')
      
      // Refresh polls if we're showing them
      if (showPolls) {
        await fetchPolls()
      }

      // Show success message for 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to save poll')
      console.error('Error saving poll:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleVote = async (pollId: string, questionIndex: number, optionIndex: number) => {
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

      alert('Vote recorded successfully!')
      
      // Refresh polls to show updated vote counts
      await fetchPolls()
      
    } catch (err: any) {
      alert(err.message || 'Failed to record vote')
      console.error('Error voting:', err)
    }
  }

  const addOption = () => {
    setOptions([...options, { id: nextOptionId, text: '' }])
    setNextOptionId(nextOptionId + 1)
  }

  const removeOption = (id: number) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id))
    }
  }

  const updateOption = (id: number, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt))
  }

  const handleCreatePoll = async () => {
    if (isAiMode) {
      setIsLoading(true)
      setError(null)
      setGeneratedPoll(null)
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: aiPrompt }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate poll')
        }

        setGeneratedPoll(data)
        console.log('Generated poll:', data)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
        console.error('Error generating poll:', err)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Manual poll creation - save directly to database
      setIsLoading(true)
      setError(null)
      
      try {
        const manualPoll = {
          title: question.length > 50 ? question.substring(0, 50) + '...' : question,
          description: 'Custom poll created manually',
          questions: [
            {
              question: question,
              options: options.map(opt => opt.text)
            }
          ]
        }

        const response = await fetch('/api/polls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(manualPoll),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save poll')
        }

        setSaveSuccess(true)
        setQuestion('')
        setOptions([
          { id: 1, text: '' },
          { id: 2, text: '' }
        ])
        setNextOptionId(3)

        // Refresh polls if showing them
        if (showPolls) {
          await fetchPolls()
        }

        // Show success message for 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
        
        console.log('Manual poll saved:', data)
      } catch (err: any) {
        setError(err.message || 'Failed to save poll')
        console.error('Error saving manual poll:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Connection Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 mr-2">
                <div className={`w-2 h-2 rounded-full ${
                  isSocketConnected ? 'bg-green-500' : 
                  isPollingMode ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span>
                  {isSocketConnected ? 'Live' : isPollingMode ? 'Polling' : 'Connecting...'}
                </span>
              </div>
              
              <button 
                onClick={() => setShowPolls(!showPolls)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="hidden sm:inline">My Polls</span>
                {savedPolls.length > 0 && (
                  <span className="bg-gradient-to-r from-purple-500 to-purple-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedPolls.length}
                  </span>
                )}
              </button>

              <button className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-900 text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-900">Dashboard</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">Create and manage your polls with ease using artificial intelligence</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-semibold text-sm sm:text-base">Poll saved successfully!</p>
            </div>
          </div>
        )}

        {/* Create Poll Section */}
        {!showPolls && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Create New Poll
          </h2>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <span className={`mr-2 sm:mr-3 text-xs sm:text-sm font-semibold ${!isAiMode ? 'text-gray-900' : 'text-gray-400'}`}>
              Manual
            </span>
            <button
              onClick={() => setIsAiMode(!isAiMode)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isAiMode ? 'bg-gradient-to-r from-purple-500 to-purple-900' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAiMode ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-2 sm:ml-3 text-xs sm:text-sm font-semibold ${isAiMode ? 'text-gray-900' : 'text-gray-400'}`}>
              AI
            </span>
          </div>

          {/* AI Mode */}
          {isAiMode && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Describe your poll
                </label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Type a poll"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm sm:text-base"
                />
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  Example: "Create a poll about favorite weekend activities"
                </p>
              </div>
              <button
                onClick={handleCreatePoll}
                disabled={!aiPrompt.trim() || isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Poll with AI</span>
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-semibold text-sm">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Poll Display */}
              {generatedPoll && (
                <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{generatedPoll.title}</h3>
                      <p className="text-gray-600 text-sm">{generatedPoll.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setGeneratedPoll(null)
                        setAiPrompt('')
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {generatedPoll.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-start gap-2">
                          <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                            {qIndex + 1}
                          </span>
                          <span className="flex-1">{q.question}</span>
                        </h4>
                        <div className="space-y-2 ml-8">
                          {q.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded transition-colors">
                              <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex-shrink-0"></div>
                              <span className="text-gray-700 text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => generatedPoll && savePoll(generatedPoll)}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-900 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Poll
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setGeneratedPoll(null)}
                      disabled={isSaving}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Mode */}
          {!isAiMode && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your poll question"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">
                  Options
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-1 sm:gap-2">
                      <span className="text-gray-500 font-semibold min-w-[20px] sm:min-w-[30px] text-sm sm:text-base">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm sm:text-base"
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(option.id)}
                          className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addOption}
                  className="mt-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Option
                </button>
              </div>

              <button
                onClick={handleCreatePoll}
                disabled={!question.trim() || options.some(opt => !opt.text.trim()) || isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Poll
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        )}

        {/* My Polls Section - Toggleable */}
        {showPolls && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                My Polls
              </h2>
              <button 
                onClick={() => setShowPolls(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {isLoadingPolls ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-12 w-12 mx-auto text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 mt-4">Loading polls...</p>
              </div>
            ) : savedPolls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-base sm:text-lg font-semibold">No polls yet</p>
                <p className="text-xs sm:text-sm">Create your first poll above</p>
              </div>
            ) : (
              <div className="space-y-6">
                {savedPolls.map(poll => (
                  <div key={poll._id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{poll.title}</h3>
                          <p className="text-sm text-gray-600">{poll.description}</p>
                        </div>
                        <button
                          onClick={() => copyPollLink(poll._id)}
                          className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white text-purple-600 border-2 border-purple-300 rounded-lg font-semibold hover:bg-purple-50 transition-all text-xs sm:text-sm"
                          title="Copy shareable link"
                        >
                          {copiedPollId === poll._id ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="hidden sm:inline">Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              <span className="hidden sm:inline">Share</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {poll.questions.map((question, qIndex) => {
                        const totalVotes = question.votes.length

                        return (
                          <div key={qIndex} className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-start gap-2">
                              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                                {qIndex + 1}
                              </span>
                              <span className="flex-1">{question.question}</span>
                            </h4>
                            
                            <div className="space-y-3 ml-8">
                              {question.options.map((option, oIndex) => {
                                const optionVotes = question.votes.filter(v => v.optionIndex === oIndex)
                                const voteCount = optionVotes.length
                                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0

                                return (
                                  <div key={oIndex} className="space-y-2">
                                    <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
                                      <button
                                        onClick={() => handleVote(poll._id, qIndex, oIndex)}
                                        className="flex items-center gap-2 hover:bg-purple-50 p-2 rounded transition-colors w-full sm:w-auto"
                                      >
                                        <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex-shrink-0"></div>
                                        <span className="font-medium text-gray-700 text-sm text-left">{option}</span>
                                      </button>
                                      <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap ml-6 sm:ml-0">
                                        {voteCount} {voteCount === 1 ? 'vote' : 'votes'} ({percentage}%)
                                      </span>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-purple-500 to-purple-900 h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    
                                    {/* Voter Names */}
                                    {optionVotes.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {optionVotes.map((vote, vIdx) => (
                                          <span
                                            key={vIdx}
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"
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
                            
                            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 font-semibold ml-8">
                              Total votes: {totalVotes}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-purple-200 text-xs sm:text-sm text-gray-500">
                      Created on {new Date(poll.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8 px-4 md:px-6 text-center mt-12">
        <p className="text-sm md:text-base">&copy; 2026 Poll-Bridge. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Dashboard