// Chat.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot, faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4001');

function Chat() {
  const [name, setName] = useState(localStorage.getItem('username') || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [clientsTotal, setClientsTotal] = useState(0);
  const [users, setUsers] = useState({});
  const [recipientId, setRecipientId] = useState('All');
  const [conversations, setConversations] = useState({ All: [] });
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
      setCountdown(10); // Commence un compte à rebours de 10 secondes
    });

    socket.on('clientsTotal', (totalClients) => {
      setClientsTotal(totalClients);
    });

    socket.on('updateUserList', (userList) => {
      setUsers(userList);
    });

    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setError(''); // Supprime le message d'erreur quand le compte à rebours atteint 0
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }

    return () => {
      socket.off('message');
      socket.off('privateMessage');
      socket.off('typing');
      socket.off('error');
      socket.off('clientsTotal');
      socket.off('updateUserList');
    };
  }, [name, recipientId, countdown]);

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
    if (message.trim() !== '' && !isBlocked) {
      const newMessage = {
        text: message,
        author: name,
        date: new Date().toLocaleString(),
        senderId: socket.id,
        recipientId: recipientId === 'All' ? 'All' : recipientId,
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
    setFeedback(''); // Clear typing feedback when switching conversations
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
              {Object.keys(users).map(
                (id) =>
                  id !== socket.id && (
                    <li
                      key={id}
                      onClick={() => handleRecipientClick(id)}
                      className={id === recipientId ? 'selectedUser' : ''}
                    >
                      {users[id]}
                    </li>
                  )
              )}
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
            <ul className="messageContainer" id="messageContainer">
              {currentMessages.map((msg, index) => (
                <li
                  key={index}
                  className={
                    msg.senderId === socket.id ? 'messageRight' : 'messageLeft'
                  }
                >
                  <p className="message">{msg.text}</p>
                  <span className="messageInfo">
                    {msg.author} - {msg.date}
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
            {error && (
              <p className="errorMessage">
                {error} {countdown > 0 && `${countdown}s`}
              </p>
            )}
            <form
              className="messageForm"
              id="messageForm"
              onSubmit={handleSubmit}
            >
              <div className='buttonContainer'>
              <input
                type="text"
                name="message"
                id="messageInput"
                className="messageInput"
                value={message}
                onChange={handleMessageChange}
                onKeyUp={handleTyping}
                disabled={countdown > 0}
              />
              <button type="submit" className="sendButton">
                <span>
                  <FontAwesomeIcon icon={faPaperPlane} />
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
