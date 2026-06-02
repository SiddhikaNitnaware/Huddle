import React, { useState } from 'react';
import './CommentCard.css';

function CommentCard({ comment, onReply, onVote }) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleReplySubmit();
    }
  };

  return (
    <div className="comment-card">
      {/* Comment Header */}
      <div className="comment-header">
        <span className="comment-number">#{comment.messageNumber}</span>
        <div className="comment-meta">
          <span className="comment-author">{comment.user}</span>
          <span className="comment-date">
            {new Date(comment.timestamp).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Comment Content */}
      <div className="comment-content">
        <p className="comment-text">{comment.text}</p>
      </div>

      {/* Comment Actions */}
      <div className="comment-actions">
        <button 
          className="action-btn vote-up"
          onClick={() => onVote('up')}
          title="Upvote"
        >
          👍
          <span className="vote-count">{comment.upvotes}</span>
        </button>
        
        <button 
          className="action-btn vote-down"
          onClick={() => onVote('down')}
          title="Downvote"
        >
          👎
          <span className="vote-count">{comment.downvotes}</span>
        </button>

        {comment.replies && comment.replies.length > 0 && (
          <button 
            className={`action-btn replies-toggle ${showReplies ? 'active' : ''}`}
            onClick={() => setShowReplies(!showReplies)}
          >
            💬
            <span className="reply-count">{comment.replies.length}</span>
          </button>
        )}

        <button 
          className={`action-btn reply-toggle ${showReplyInput ? 'active' : ''}`}
          onClick={() => setShowReplyInput(!showReplyInput)}
        >
          ↩️
        </button>
      </div>

      {/* Replies Section */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          <div className="replies-header">
            <span>Replies</span>
            <button 
              className="close-btn"
              onClick={() => setShowReplies(false)}
            >
              ✕
            </button>
          </div>
          <div className="replies-list">
            {comment.replies.map((reply, idx) => (
              <div key={idx} className="reply-item">
                <div className="reply-header">
                  <span className="reply-number">&gt;{reply.messageNumber}</span>
                  <span className="reply-author">{reply.user}</span>
                </div>
                <p className="reply-text">{reply.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Input */}
      {showReplyInput && (
        <div className="reply-input-section">
          <div className="reply-input-header">
            <span>Reply to #{comment.messageNumber}</span>
            <button 
              className="close-btn"
              onClick={() => setShowReplyInput(false)}
            >
              ✕
            </button>
          </div>
          <div className="reply-input-form">
            <input
              type="text"
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <button 
              className="send-btn"
              onClick={handleReplySubmit}
              disabled={!replyText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentCard;