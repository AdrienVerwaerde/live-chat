import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4001');

function Chat() {
  const [name, setName] = useState(localStorage.getItem('username') || ''); // Prefill with stored username
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [clientsTotal, setClientsTotal] = useState(0);
  const [users, setUsers] = useState({});
  const [recipientId, setRecipientId] = useState('All');
  const [conversations, setConversations] = useState({ All: [] });
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [socketId, setSocketId] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  useEffect(() => {
    if (!userId) {
      const generatedId = socket.id;
      localStorage.setItem('userId', generatedId);
      setUserId(generatedId);
    }
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id);
    });
  }, []);

  // When a new message is posted, scroll to the bottom to show it //
  const messageContainerRef = useRef(null);
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, feedback]);
  //----------------------------------------------------------------//

  // Get messages when connecting to the chat //
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/messages/');
        const messagesFromDb = response.data;
        setMessages(messagesFromDb);
        setConversations((prevConversations) => ({
          ...prevConversations,
          All: messagesFromDb,
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);
  //----------------------------------------------------------------//

  useEffect(() => {
    if (name) {
      socket.emit('setUsername', name);
    }

    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setConversations((prevConversations) => ({
        ...prevConversations,
        All: [...prevConversations.All, newMessage],
      }));
    });

    socket.on('privateMessage', (newMessage) => {
      const recipientKey =
        newMessage.senderId === socket.id
          ? newMessage.recipientId
          : newMessage.senderId;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setConversations((prevConversations) => ({
        ...prevConversations,
        [recipientKey]: [
          ...(prevConversations[recipientKey] || []),
          newMessage,
        ],
      }));
    });

    socket.on('typing', ({ recipientId: typingRecipientId, feedback }) => {
      if (typingRecipientId === recipientId) {
        setFeedback(feedback);
      }
    });

    socket.on('error', (errorData) => {
      setError(errorData.message);
      setIsBlocked(true);
      setTimeout(() => {
        setError('');
        setIsBlocked(false);
      }, 10000);
    });

    socket.on('clientsTotal', (totalClients) => {
      setClientsTotal(totalClients);
    });

    socket.on('updateUserList', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('message');
      socket.off('privateMessage');
      socket.off('typing');
      socket.off('error');
      socket.off('clientsTotal');
      socket.off('updateUserList');
    };
  }, [name, recipientId]);


  const handleNameChange = (e) => {
    setName(e.target.value);
    socket.emit('setUsername', e.target.value);
  };

  const handleMessageChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    if (newValue.trim() === '') {
      socket.emit('stopTyping', recipientId);
    } else {
      handleTyping();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const newMessage = {
        text: message,
        author: name,
        date: new Date().toISOString(),
        senderId: socket.id,
        recipientId: recipientId === 'All' ? 'All' : recipientId,
        userId: localStorage.getItem('userId') || '',
      };
      socket.emit('message', newMessage);
      setMessage('');
      setFeedback('');
      socket.emit('stopTyping', recipientId);
    }
  };

  const handleTyping = () => {
    if (message.trim() !== '') {
      socket.emit('typing', {
        recipientId,
        feedback: `${name} is typing a message...`,
      });
    }
  };

  const handleRecipientClick = (id) => {
    setRecipientId(id);
    setFeedback('');
    socket.emit('stopTyping', id);
  };

  const currentMessages = conversations[recipientId] || [];

  return (
    <>
      <h1 className="title">🐱 iChat</h1>
      <div className="fullBody">
        <div className="main flex">
          <div className="userList">
            <h3>Users:</h3>
            <ul>
              <li
                key="All"
                onClick={() => handleRecipientClick('All')}
                className={recipientId === 'All' ? 'selectedUser' : ''}
              >
                All
              </li>
              {Object.keys(users).map((id) => {
                if (id === socket.id) return null;

                return (
                  <li
                    key={id}
                    onClick={() => handleRecipientClick(id)}
                    className={id === recipientId ? 'selectedUser' : ''}
                  >
                    <div className="userItem">
                      <span
                        className={`userStatus ${users[id]?.online ? 'userOnline' : 'userOffline'
                          }`}
                      ></span>
                      {users[id]?.username || 'Unknown'}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="conversation">
            <div className="name">
              <span className="flex">
                <FontAwesomeIcon icon={faUser} />
                <input
                  type="text"
                  className="nameInput"
                  id="nameInput"
                  value={name}
                  onChange={handleNameChange}
                  maxLength="20"
                />
              </span>
            </div>
            <ul className="messageContainer"
              id="messageContainer"
              ref={messageContainerRef}
            >
              {currentMessages.map((msg, index) => (
                <li
                  key={index}
                  className={
                    msg.userId === localStorage.getItem('userId') ? 'messageRight' : 'messageLeft'
                  }
                >
                  <p className="message">{msg.text}</p>
                  <span className='messageInfo'>
                    {msg.author} - {new Date(msg.date).toLocaleString()}
                  </span>
                </li>
              ))}
              {feedback && (
                <li className="messageFeedback">
                  <p className="feedback" id="feedback">
                    {feedback}
                  </p>
                </li>
              )}
            </ul>
            {error && <p className="errorMessage">{error}</p>}
            <form
              className="messageForm"
              id="messageForm"
              onSubmit={handleSubmit}
            >
              <div className="buttonContainer">
                <input
                  type="text"
                  name="message"
                  id="messageInput"
                  className="messageInput"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyUp={handleTyping}
                  disabled={isBlocked}
                />
                <button type="submit" className="sendButton" disabled={isBlocked}>
                  <span>
                    <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '1px' }} />
                  </span>
                </button>
              </div>
            </form>
            <h3 className="clientsTotal" id="ClientTotal">
              Total Clients: {clientsTotal}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
