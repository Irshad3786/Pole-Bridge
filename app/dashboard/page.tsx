'use client'

import React, { useState } from 'react'
import Logo from '@/components/Logo'
import { signOut } from 'next-auth/react'

interface Option {
  id: number
  text: string
}

interface Vote {
  optionId: number
  voterName: string
}

interface Poll {
  id: number
  question: string
  options: { id: number; text: string }[]
  votes: Vote[]
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
  
  // Mock polls data - in real app this would come from API
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 1,
      question: 'What is your favorite programming language?',
      options: [
        { id: 1, text: 'JavaScript' },
        { id: 2, text: 'Python' },
        { id: 3, text: 'TypeScript' },
        { id: 4, text: 'Go' }
      ],
      votes: [
        { optionId: 1, voterName: 'John Doe' },
        { optionId: 1, voterName: 'Jane Smith' },
        { optionId: 2, voterName: 'Bob Wilson' },
        { optionId: 3, voterName: 'Alice Brown' },
        { optionId: 3, voterName: 'Charlie Davis' },
        { optionId: 3, voterName: 'Diana Miller' }
      ]
    },
    {
      id: 2,
      question: 'Best time for team meetings?',
      options: [
        { id: 1, text: 'Morning (9-11 AM)' },
        { id: 2, text: 'Afternoon (2-4 PM)' }
      ],
      votes: [
        { optionId: 1, voterName: 'Sarah Johnson' },
        { optionId: 2, voterName: 'Mike Chen' },
        { optionId: 2, voterName: 'Emma Watson' }
      ]
    }
  ])

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

  const handleCreatePoll = () => {
    if (isAiMode) {
      console.log('Creating AI poll with prompt:', aiPrompt)
      // API integration will go here
    } else {
      console.log('Creating manual poll:', { question, options })
      // API integration will go here
    }
  }

  const getVoteCount = (poll: Poll, optionId: number) => {
    return poll.votes.filter(vote => vote.optionId === optionId).length
  }

  const getVoterNames = (poll: Poll, optionId: number) => {
    return poll.votes.filter(vote => vote.optionId === optionId).map(vote => vote.voterName)
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
              <button 
                onClick={() => setShowPolls(!showPolls)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="hidden sm:inline">My Polls</span>
                {polls.length > 0 && (
                  <span className="bg-gradient-to-r from-purple-500 to-purple-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {polls.length}
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
                disabled={!aiPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Poll with AI</span>
              </button>
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
                disabled={!question.trim() || options.some(opt => !opt.text.trim())}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Poll
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
            
            {polls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-base sm:text-lg font-semibold">No polls yet</p>
                <p className="text-xs sm:text-sm">Create your first poll above</p>
              </div>
            ) : (
              <div className="space-y-6">
                {polls.map(poll => (
                  <div key={poll.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">{poll.question}</h3>
                    
                    <div className="space-y-4">
                      {poll.options.map(option => {
                        const voteCount = getVoteCount(poll, option.id)
                        const voterNames = getVoterNames(poll, option.id)
                        const totalVotes = poll.votes.length
                        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0

                        return (
                          <div key={option.id} className="space-y-2 bg-white rounded-lg p-3 sm:p-4">
                            <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
                              <span className="font-semibold text-gray-700 text-sm sm:text-base break-words w-full sm:w-auto">{option.text}</span>
                              <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
                                {voteCount} {voteCount === 1 ? 'vote' : 'votes'} ({percentage}%)
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-purple-900 h-2.5 sm:h-3 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            
                            {/* Voter Names */}
                            {voterNames.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                                {voterNames.map((name, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-purple-200 text-xs sm:text-sm text-gray-600 font-semibold">
                      Total votes: {poll.votes.length}
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