import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Search, MessageSquare, Check, CheckCheck, Paperclip, Video, Phone, PhoneOff, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { io } from 'socket.io-client';

let socket;

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);
  
  // File Upload
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // WebRTC
  const [callState, setCallState] = useState('idle'); // idle, calling, receiving, connected
  const [incomingCallData, setIncomingCallData] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  // Connect socket
  useEffect(() => {
    socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    if (user?._id) socket.emit('join', user._id);

    socket.on('new_message', ({ conversationId, message }) => {
      setActiveConv(prev => {
        if (prev?._id === conversationId) {
          setMessages(msgs => [...msgs, message]);
        }
        return prev;
      });
      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId ? { ...c, lastMessage: message, lastMessageAt: new Date() } : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    socket.on('user_typing', ({ name }) => setTypingUser(name));
    socket.on('user_stopped_typing', () => setTypingUser(null));

    // WebRTC Signaling
    socket.on('incoming_call', ({ signal, from, name }) => {
      setCallState('receiving');
      setIncomingCallData({ signal, from, name });
    });
    socket.on('call_accepted', (signal) => {
      setCallState('connected');
      if (peerConnection.current) peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
    });
    socket.on('call_ended', () => endCallLocal());
    socket.on('call_rejected', () => { endCallLocal(); alert('Call was rejected'); });
    socket.on('webrtc_ice_candidate', (candidate) => {
      if (peerConnection.current) peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => { socket.disconnect(); };
  }, [user]);

  // WebRTC Call Logic
  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      alert('Camera/Mic permission denied');
      return null;
    }
  };

  const createPeer = (stream, recipientId) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnection.current = pc;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.onicecandidate = (e) => e.candidate && socket?.emit('webrtc_ice_candidate', { to: recipientId, candidate: e.candidate });
    pc.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    return pc;
  };

  const startCall = async () => {
    const otherUser = getOtherParticipant(activeConv);
    if (!otherUser) return;
    const stream = await setupMedia();
    if (!stream) return;
    setCallState('calling');
    const pc = createPeer(stream, otherUser._id);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket?.emit('call_user', { userToCall: otherUser._id, signalData: offer, from: user._id, name: user.name });
  };

  const answerCall = async () => {
    setCallState('connected');
    const stream = await setupMedia();
    if (!stream) return;
    const pc = createPeer(stream, incomingCallData.from);
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket?.emit('answer_call', { signal: answer, to: incomingCallData.from });
  };

  const rejectCall = () => {
    socket?.emit('reject_call', { to: incomingCallData.from });
    setCallState('idle'); setIncomingCallData(null);
  };

  const endCallLocal = () => {
    setCallState('idle');
    if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null; }
    if (localStream.current) { localStream.current.getTracks().forEach(t => t.stop()); localStream.current = null; }
    setIncomingCallData(null);
  };

  const stopCall = () => {
    const otherId = getOtherParticipant(activeConv)?._id || incomingCallData?.from;
    if (otherId) socket?.emit('end_call', { to: otherId });
    endCallLocal();
  };

  // Load conversations, then auto-open one if navigated from elsewhere
  useEffect(() => {
    api.get('/chat/conversations').then(res => {
      const convs = res.data.conversations || [];
      setConversations(convs);
      setLoading(false);

      // If redirected here with a specific conversation (e.g. from "Message" button)
      const passedState = location.state;
      if (passedState?.openConversationId) {
        // find in list or use the passed conversation object
        const existing = convs.find(c => c._id === passedState.openConversationId);
        setActiveConv(existing || passedState.conversation || null);
      }
    }).catch(() => setLoading(false));
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeConv) return;
    socket?.emit('join_conversation', activeConv._id);
    api.get(`/chat/conversations/${activeConv._id}/messages`).then(res => {
      setMessages(res.data.messages || []);
      scrollToBottom();
    });
    return () => socket?.emit('leave_conversation', activeConv._id);
  }, [activeConv?._id]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = async () => {
    if ((!input.trim() && !file) || !activeConv) return;
    const content = input.trim();
    setInput('');
    socket?.emit('typing_stop', { conversationId: activeConv._id, userId: user._id });

    try {
      let fileUrl = '';
      let fileName = '';
      let msgType = 'text';

      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fileUrl = uploadRes.data.fileUrl;
        fileName = uploadRes.data.fileName;
        msgType = file.type.startsWith('image/') ? 'image' : 'file';
        setFile(null);
        setUploading(false);
      }

      const res = await api.post(`/chat/conversations/${activeConv._id}/messages`, { content, type: msgType, fileUrl, fileName });
      const msg = res.data.message;
      setMessages(prev => [...prev, msg]);
      socket?.emit('send_message', {
        conversationId: activeConv._id,
        message: { ...msg, recipientId: getOtherParticipant(activeConv)?._id },
      });
      setConversations(prev =>
        prev.map(c =>
          c._id === activeConv._id ? { ...c, lastMessage: msg, lastMessageAt: new Date() } : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    } catch (err) { console.error(err); setUploading(false); }
  };

  const handleTyping = (val) => {
    setInput(val);
    if (!activeConv) return;
    socket?.emit('typing_start', { conversationId: activeConv._id, userId: user._id, name: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('typing_stop', { conversationId: activeConv._id, userId: user._id });
    }, 1500);
  };

  const getOtherParticipant = (conv) => conv?.participants?.find(p => p._id !== user?._id);

  const filteredConvs = conversations.filter(c => {
    const other = getOtherParticipant(c);
    return other?.name?.toLowerCase().includes(searchQ.toLowerCase());
  });

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="page-enter" style={{ height: 'calc(100vh - 130px)', display: 'flex', borderRadius: 16, overflow: 'hidden', border: '1px solid #e4e4e7', background: 'white' }}>

      {/* Sidebar */}
      <div style={{ width: 300, borderRight: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f4f4f5' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#0a2416' }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input placeholder="Search conversations..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1.5px solid #e4e4e7', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#a1a1aa', fontSize: 13 }}>Loading...</div>
          ) : filteredConvs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <MessageSquare size={32} color="#e4e4e7" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#a1a1aa' }}>No conversations yet</p>
              <p style={{ fontSize: 12, color: '#d4d4d8', marginTop: 4 }}>Message a freelancer or client to get started</p>
            </div>
          ) : filteredConvs.map(conv => {
            const other = getOtherParticipant(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <div key={conv._id} onClick={() => setActiveConv(conv)}
                style={{ padding: '12px 14px', cursor: 'pointer', background: isActive ? '#f0faf4' : 'white', borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent', transition: 'all 0.15s', display: 'flex', gap: 10, alignItems: 'center' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'white'; }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {other?.avatar ? <img src={other.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{other?.name?.[0]}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{other?.name}</span>
                    <span style={{ fontSize: 11, color: '#a1a1aa', flexShrink: 0 }}>{conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage?.content || <em style={{ color: '#d4d4d8' }}>No messages yet</em>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {activeConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {getOtherParticipant(activeConv)?.avatar
                  ? <img src={getOtherParticipant(activeConv).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{getOtherParticipant(activeConv)?.name?.[0]}</span>}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#18181b' }}>{getOtherParticipant(activeConv)?.name}</div>
                {activeConv.gig && <div style={{ fontSize: 12, color: '#71717a' }}>Re: {activeConv.gig?.title}</div>}
              </div>
            </div>
            {/* Video Call Button */}
            <button onClick={startCall} style={{ background: '#f0faf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Video size={16} /> Call
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 40, color: '#a1a1aa' }}>
                <MessageSquare size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>No messages yet. Say hello! 👋</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
              const showDate = i === 0 || formatDate(msg.createdAt) !== formatDate(messages[i - 1]?.createdAt);
              return (
                <React.Fragment key={msg._id}>
                  {showDate && <div style={{ textAlign: 'center', fontSize: 12, color: '#a1a1aa', margin: '8px 0' }}>{formatDate(msg.createdAt)}</div>}
                  <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                    {!isMe && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0a2416, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{msg.sender?.name?.[0]}</span>
                      </div>
                    )}
                    <div style={{ maxWidth: '68%' }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMe ? 'linear-gradient(135deg, #0a2416, #16a34a)' : '#f4f4f5',
                        color: isMe ? 'white' : '#18181b', fontSize: 14, lineHeight: 1.5,
                      }}>
                        {msg.isDeleted ? <em style={{ opacity: 0.6 }}>Message deleted</em> : (
                          <>
                            {msg.type === 'image' && msg.fileUrl && (
                              <img src={msg.fileUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 5 }} />
                            )}
                            {msg.type === 'file' && msg.fileUrl && (
                              <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems:'center', gap:6, padding: '10px 12px', background: isMe ? 'rgba(255,255,255,0.15)' : '#e4e4e7', borderRadius: 8, color: 'inherit', textDecoration: 'none', marginBottom: 5 }}>
                                <Download size={16} /> <span>{msg.fileName || 'Download File'}</span>
                              </a>
                            )}
                            {msg.content && <div>{msg.content}</div>}
                          </>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#a1a1aa', textAlign: isMe ? 'right' : 'left', marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 4 }}>
                        {formatTime(msg.createdAt)}
                        {isMe && (msg.isRead ? <CheckCheck size={12} color="#16a34a" /> : <Check size={12} />)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {typingUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: '10px 14px', background: '#f4f4f5', borderRadius: '18px 18px 18px 4px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a1a1aa', animation: `bounce 1s ${d}s infinite` }} />)}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#a1a1aa' }}>{typingUser} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e4e4e7', display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="file" id="file" hidden onChange={e => setFile(e.target.files[0])} accept="image/*,.pdf,.doc,.docx" />
            <label htmlFor="file" style={{ cursor: 'pointer', padding: 10, borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paperclip size={18} color="#71717a" />
            </label>
            {file && (
              <div style={{ fontSize: 12, background: '#f4f4f5', padding: '6px 10px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <X size={14} color="#ef4444" onClick={() => setFile(null)} style={{ cursor: 'pointer' }} />
              </div>
            )}
            <input placeholder="Type a message..."
              value={input} onChange={e => handleTyping(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              style={{ flex: 1, padding: '11px 16px', border: '1.5px solid #e4e4e7', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e4e4e7'} />
            <button onClick={handleSend} disabled={(!input.trim() && !file) || uploading}
              style={{ width: 44, height: 44, borderRadius: '50%', background: (input.trim() || file) && !uploading ? 'linear-gradient(135deg, #0a2416, #16a34a)' : '#f4f4f5', border: 'none', cursor: (input.trim() || file) && !uploading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: uploading ? 0.5 : 1 }}>
              <Send size={18} color={(input.trim() || file) && !uploading ? 'white' : '#a1a1aa'} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
          <MessageSquare size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#52525b', marginBottom: 6 }}>Select a conversation</p>
          <p style={{ fontSize: 14 }}>Choose from your conversations on the left</p>
        </div>
      )}

      {/* WebRTC OVERLAYS */}
      {callState === 'receiving' && incomingCallData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 30, borderRadius: 16, textAlign: 'center', width: 300 }}>
            <div style={{ width: 60, height: 60, background: '#f0faf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Phone size={28} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>{incomingCallData.name} is calling</h3>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24 }}>Incoming Video Call</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={rejectCall} style={{ flex: 1, padding: '10px 0', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Decline</button>
              <button onClick={answerCall} style={{ flex: 1, padding: '10px 0', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Answer</button>
            </div>
          </div>
        </div>
      )}

      {(callState === 'calling' || callState === 'connected') && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#18181b', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', color: 'white' }}>
            <h2>{callState === 'calling' ? 'Calling...' : 'Connected'}</h2>
            <button onClick={stopCall} style={{ width: 44, height: 44, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneOff size={20} />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', padding: 20, gap: 20, position: 'relative' }}>
            {/* Remote Video (Big) */}
            <div style={{ flex: 1, background: 'black', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              <video playsInline ref={remoteVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {callState === 'calling' && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontSize: 18 }}>Waiting for answer...</div>}
            </div>
            {/* Local Video (Small, floating) */}
            <div style={{ position: 'absolute', bottom: 40, right: 40, width: 240, height: 160, background: 'black', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
              <video playsInline muted ref={localVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MessagesPage;
