import React, { useEffect, useMemo, useState } from 'react';
import FeaturePage from '../components/layout/FeaturePage';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Chats = () => {
  const { user } = useAuth();
  const { emit, on, joinConversation, leaveConversation } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedId) || null,
    [conversations, selectedId]
  );

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    joinConversation(selectedId);
    loadMessages(selectedId);

    const unsubscribe = on('new_message', ({ message, conversationId }) => {
      if (conversationId !== selectedId) {
        // Update last message in list for background conversations
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId
              ? { ...c, lastMessage: message.content?.slice(0, 100) || '', lastMessageAt: message.createdAt }
              : c
          )
        );
        return;
      }
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: message.content?.slice(0, 100) || '', lastMessageAt: message.createdAt }
            : c
        )
      );
    });

    return () => {
      leaveConversation(selectedId);
      unsubscribe?.();
    };
  }, [selectedId]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setError('');
      const res = await api.get('/chat/conversations');
      setConversations(res.data?.data?.conversations || []);
      if (!selectedId && res.data?.data?.conversations?.length) {
        setSelectedId(res.data.data.conversations[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      setError('');
      const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page: 1, limit: 50 },
      });
      setMessages(res.data?.data?.messages || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (id) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setMessages([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedId || sending) return;
    const content = messageInput.trim();
    setSending(true);
    emit('send_message', { conversationId: selectedId, content }, (resp) => {
      setSending(false);
      if (resp?.error) {
        setError(resp.error);
        return;
      }
      if (resp?.message) {
        setMessages((prev) => [...prev, resp.message]);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === selectedId
              ? {
                  ...c,
                  lastMessage: resp.message.content?.slice(0, 100) || '',
                  lastMessageAt: resp.message.createdAt,
                }
              : c
          )
        );
        setMessageInput('');
      }
    });
  };

  const renderPartnerName = (conv) => {
    if (!user) return 'Conversation';
    const others = (conv.participantIds || []).filter((p) => p._id !== user.id && p._id !== user._id);
    if (conv.isGroup || others.length !== 1) {
      return conv.title || 'Group chat';
    }
    return others[0]?.name || 'Conversation';
  };

  return (
    <FeaturePage
      title="Chats"
      subtitle="Direct and group conversations for clubs, events, and teams."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Conversation list */}
        <aside className="border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Conversations
            </h2>
          </div>
          {loadingConversations ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4 text-center text-xs text-gray-500">
              You have no conversations yet. Start connecting with people from the Network tab.
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <li
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`px-4 py-3 cursor-pointer text-sm border-b border-gray-50 flex items-start gap-2 ${
                    conv._id === selectedId
                      ? 'bg-blue-50/70 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{renderPartnerName(conv)}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat window */}
        <section className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {renderPartnerName(selectedConversation)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.isGroup ? 'Group conversation' : 'Direct message'}
                  </p>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500">
                    No messages yet. Say hello 👋
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine =
                      m.senderId?._id === user?.id || m.senderId === user?.id || m.senderId?._id === user?._id;
                    const senderName =
                      typeof m.senderId === 'object' ? m.senderId.name : isMine ? 'You' : 'User';
                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          {!isMine && (
                            <p className="text-[10px] font-medium text-gray-500 mb-0.5">
                              {senderName}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p
                            className={`mt-1 text-[9px] ${
                              isMine ? 'text-blue-100/80' : 'text-gray-400'
                            }`}
                          >
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <footer className="border-t border-gray-100 px-3 py-2">
                {error && (
                  <p className="text-[11px] text-red-600 mb-1 px-2">{error}</p>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 text-sm border border-gray-300 rounded-full px-3 py-2 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                Select a conversation to start chatting
              </h2>
              <p className="text-xs text-gray-500">
                Your recent conversations will appear here once you start messaging.
              </p>
            </div>
          )}
        </section>
      </div>
    </FeaturePage>
  );
};

export default Chats;
