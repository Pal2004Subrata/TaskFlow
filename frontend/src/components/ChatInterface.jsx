import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Reply, X, CornerDownRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ workspaceId, members = [] }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Mention states
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Poll for messages every 3 seconds
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/messages`);
      return res.data.data.messages;
    },
    refetchInterval: 3000,
  });

  const messages = messagesData || [];

  const sendMessageMutation = useMutation({
    mutationFn: (payload) => api.post(`/workspaces/${workspaceId}/messages`, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['messages', workspaceId] });
      const previousMessages = queryClient.getQueryData(['messages', workspaceId]);

      const optMsg = {
        _id: Date.now().toString(),
        content: payload.content,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      if (payload.replyTo) {
        optMsg.replyTo = replyingTo;
      }

      queryClient.setQueryData(['messages', workspaceId], (old) => [
        ...(old || []),
        optMsg,
      ]);

      return { previousMessages };
    },
    onError: (err, newMsg, context) => {
      queryClient.setQueryData(['messages', workspaceId], context.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', workspaceId] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Mentions
  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);

    // Simple mention detection: last word starts with @
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const words = textBeforeCursor.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const filteredMembers = mentionQuery !== null 
    ? members.filter(m => m._id !== user._id && m.name.toLowerCase().includes(mentionQuery))
    : [];

  const handleMentionSelect = (member) => {
    const cursor = inputRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursor);
    const textAfterCursor = content.slice(cursor);
    const words = textBeforeCursor.split(' ');
    words.pop(); // remove the @query part
    const newTextBeforeCursor = words.join(' ') + (words.length > 0 ? ' ' : '') + `@${member.name} `;
    
    setContent(newTextBeforeCursor + textAfterCursor);
    setMentionQuery(null);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => (i < filteredMembers.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => (i > 0 ? i - 1 : filteredMembers.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = mentionIndex >= 0 ? filteredMembers[mentionIndex] : filteredMembers[0];
        handleMentionSelect(selected);
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Detect mentioned users by parsing the content for @Names
    const mentionedIds = [];
    members.forEach(member => {
      if (content.includes(`@${member.name}`) && member._id !== user._id) {
        mentionedIds.push(member._id);
      }
    });

    const payload = {
      content: content.trim(),
      mentions: mentionedIds
    };

    if (replyingTo) {
      payload.replyTo = replyingTo._id;
    }

    sendMessageMutation.mutate(payload);
    setContent('');
    setReplyingTo(null);
    setMentionQuery(null);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <Send className="w-6 h-6 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">No messages yet</p>
              <p className="text-sm">Start the conversation with your team!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender._id === user._id;
              
              // Format mentions in text to be bold and colored
              const renderContent = (text) => {
                let formattedText = text;
                members.forEach(member => {
                  const mentionStr = `@${member.name}`;
                  if (formattedText.includes(mentionStr)) {
                    const isMentioningMe = member._id === user._id;
                    const mentionClass = isMentioningMe 
                      ? 'bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-semibold'
                      : 'text-indigo-600 font-semibold';
                    
                    // Simple replacement (works for basic cases, not perfect if names overlap, but good enough)
                    formattedText = formattedText.split(mentionStr).join(`<span class="${mentionClass}">${mentionStr}</span>`);
                  }
                });
                return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
              };
              
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 max-w-[80%] group ${isMe ? 'ml-auto flex-row-reverse' : ''} ${msg.isOptimistic ? 'opacity-70' : ''}`}
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-[10px] font-bold text-indigo-700 mt-auto">
                    {msg.sender.avatar ? (
                      <img src={msg.sender.avatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                    ) : (
                      msg.sender.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative`}>
                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[11px] font-medium text-slate-500 ml-1 mr-1">
                        {isMe ? 'You' : msg.sender.name}
                      </span>
                      <button 
                        onClick={() => setReplyingTo(msg)}
                        className={`text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 ${isMe ? 'mr-1' : 'ml-1'}`}
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div 
                      className={`relative px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm flex flex-col gap-1 ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      {/* Replied Message Block */}
                      {msg.replyTo && (
                        <div className={`text-xs p-2 rounded-lg mb-1 flex flex-col gap-0.5 ${isMe ? 'bg-indigo-700/50 border-l-2 border-indigo-300' : 'bg-slate-100 border-l-2 border-indigo-400'}`}>
                          <span className={`font-semibold ${isMe ? 'text-indigo-200' : 'text-indigo-600'}`}>
                            {msg.replyTo.sender?.name || 'Someone'}
                          </span>
                          <span className={`line-clamp-1 opacity-90 ${isMe ? 'text-indigo-50' : 'text-slate-600'}`}>
                            {msg.replyTo.content}
                          </span>
                        </div>
                      )}
                      
                      {renderContent(msg.content)}
                    </div>
                    
                    <span className="text-[10px] text-slate-400 mt-1 ml-1 mr-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Mention Dropdown */}
      <AnimatePresence>
        {mentionQuery !== null && filteredMembers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[72px] left-4 bg-white border border-slate-200 rounded-xl shadow-xl z-10 w-64 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filteredMembers.map((member, idx) => (
              <button
                key={member._id}
                onClick={() => handleMentionSelect(member)}
                onMouseEnter={() => setMentionIndex(idx)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${idx === mentionIndex || (mentionIndex === -1 && idx === 0) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center shrink-0">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-medium truncate">{member.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 shrink-0 flex flex-col">
        
        {/* Reply Banner */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between px-4 py-2.5 overflow-hidden"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <CornerDownRight className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-indigo-600">
                    Replying to {replyingTo.sender.name}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {replyingTo.content}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 rounded-full hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex items-center gap-3 relative p-4">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (use @ to mention)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 placeholder:text-slate-400"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full transition-colors"
          >
            <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
