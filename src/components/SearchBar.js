import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic } from 'lucide-react';

const SearchBar = ({ 
  onSearch, 
  placeholder = "What are you looking for today?",
  showVoiceSearch = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        onSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-gray700" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-16 py-4 
            border border-neutral-gray100 rounded-button 
            focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent
            text-body font-figtree
            bg-white shadow-card
          "
        />
        
        {showVoiceSearch && (
          <motion.button
            type="button"
            onClick={handleVoiceSearch}
            className={`
              absolute inset-y-0 right-0 pr-4 flex items-center
              ${isListening ? 'text-primary-pink' : 'text-neutral-gray700'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
          </motion.button>
        )}
      </div>
      
      {isListening && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 p-3 bg-primary-pink text-white rounded-button text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎤 Listening... Speak now
        </motion.div>
      )}
    </motion.form>
  );
};

export default SearchBar;
