
/*
import { useState, useRef, useEffect } from 'react';

const ShareMenu = ({ file, isOpen, onClose, position = { x: 0, y: 0 } }) => {
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate shareable text
  const shareText = `Check out this file: ${file.original_name}`;
  const shareUrl = `${window.location.origin}/file/${file.id}`; // You can update this URL

  // Share handlers for different platforms
  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const shareToEmail = () => {
    const subject = `Sharing file: ${file.original_name}`;
    const body = `${shareText}\n\nDownload link: ${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    onClose();
  };

  const shareToSkype = () => {
    const url = `https://web.skype.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    onClose();
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing via URL
    // We'll copy to clipboard and show a message
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 2000);
    alert('Link copied! Paste it into Instagram.');
  };

  const shareToTikTok = () => {
    // TikTok doesn't support direct sharing via URL
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 2000);
    alert('Link copied! Paste it into TikTok.');
  };

  const openWPSOffice = () => {
    // WPS Office integration
    const wpsUrl = `wps:open?url=${encodeURIComponent(shareUrl)}`;
    window.open(wpsUrl, '_blank');
    onClose();
  };

  const openWordEditor = () => {
    // Microsoft Word integration
    const wordUrl = `ms-word:ofe|u|${encodeURIComponent(shareUrl)}`;
    window.open(wordUrl, '_blank');
    onClose();
  };

  const openWPSApp = () => {
    // WPS Office App
    const wpsAppUrl = `wps-office:open?file=${encodeURIComponent(shareUrl)}`;
    window.open(wpsAppUrl, '_blank');
    onClose();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💚',
      color: 'hover:bg-green-50 text-green-600',
      handler: shareToWhatsApp
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'hover:bg-blue-50 text-blue-600',
      handler: shareToEmail
    },
    {
      name: 'Skype',
      icon: '💙',
      color: 'hover:bg-sky-50 text-sky-600',
      handler: shareToSkype
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: 'hover:bg-pink-50 text-pink-600',
      handler: shareToInstagram
    },
    {
      name: 'TikTok',
      icon: '🎵',
      color: 'hover:bg-black text-black',
      handler: shareToTikTok
    },
    {
      name: 'WPS Editor',
      icon: '📝',
      color: 'hover:bg-purple-50 text-purple-600',
      handler: openWPSOffice
    },
    {
      name: 'Word Editor',
      icon: '📘',
      color: 'hover:bg-blue-50 text-blue-700',
      handler: openWordEditor
    },
    {
      name: 'WPS Office',
      icon: '📱',
      color: 'hover:bg-orange-50 text-orange-600',
      handler: openWPSApp
    },
    {
      name: 'Copy Link',
      icon: copied ? '✅' : '📋',
      color: copied ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-600',
      handler: copyLink
    }
  ];

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translateX(-100%)',
        zIndex:99999,
      }}
    >

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-lg mr-2">🔗</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Share File</h4>
            <p className="text-xs text-gray-500 truncate max-w-[180px]">
              {file.original_name}
            </p>
          </div>
        </div>
      </div>


      <div className="py-2 max-h-[300px] overflow-y-auto">
        {shareOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.handler}
            className={`w-full flex items-center px-4 py-3 text-sm ${option.color} transition-colors duration-150`}
          >
            <span className="text-xl mr-3">{option.icon}</span>
            <span className="font-medium">{option.name}</span>
            {option.name === 'Copy Link' && copied && (
              <span className="ml-auto text-xs text-green-600">Copied!</span>
            )}
          </button>
        ))}
      </div>

  
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          File size: {formatFileSize(file.file_size)}
        </p>
      </div>

      
    </div>
  );
};

// Helper function
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default ShareMenu;*/



/*


import React from 'react';

const ShareModal = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const handleShare = (platform) => {
    const shareText = `Check out this file: ${file.original_name}`;
    const shareUrl = `${window.location.origin}/file/${file.id}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      case 'skype':
        window.open(`https://web.skype.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'instagram':
      case 'tiktok':
        navigator.clipboard.writeText(shareUrl);
        alert(`Link copied! Paste it into ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`);
        break;
      case 'wps':
      case 'word':
        alert(`Open ${platform.toUpperCase()} and paste this link: ${shareUrl}`);
        navigator.clipboard.writeText(shareUrl);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      default:
        alert(`Sharing to ${platform} - Feature coming soon!`);
    }
    
    onClose();
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: '💚', color: 'bg-green-50 border-green-200 hover:bg-green-100', platform: 'whatsapp' },
    { name: 'Email', icon: '📧', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100', platform: 'email' },
    { name: 'Skype', icon: '💙', color: 'bg-sky-50 border-sky-200 hover:bg-sky-100', platform: 'skype' },
    { name: 'Instagram', icon: '📸', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100', platform: 'instagram' },
    { name: 'TikTok', icon: '🎵', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100', platform: 'tiktok' },
    { name: 'WPS Editor', icon: '📝', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100', platform: 'wps' },
    { name: 'Word Editor', icon: '📘', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100', platform: 'word' },
    { name: 'Copy Link', icon: '📋', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100', platform: 'copy' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
      
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Share File</h3>
            <p className="text-sm text-gray-600 truncate max-w-[250px]" title={file.original_name}>
              {file.original_name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl p-1"
          >
            ✕
          </button>
        </div>
        
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option, index) => (
              <button 
                key={index}
                onClick={() => handleShare(option.platform)}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 hover:-translate-y-1 ${option.color}`}
              >
                <span className="text-2xl mb-2">{option.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{option.name}</span>
              </button>
            ))}
          </div>
          
          
          <div className="mt-6 pt-4 border-t">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;*/







import React from 'react';

const ShareModal = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const handleShare = (platform) => {
    const shareText = `Check out this file: ${file.original_name}`;
    const shareUrl = `${window.location.origin}/file/${file.id}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      case 'skype':
        window.open(`https://web.skype.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'instagram':
      case 'tiktok':
        navigator.clipboard.writeText(shareUrl);
        alert(`Link copied! Paste it into ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`);
        break;
      case 'wps':
      case 'word':
        alert(`Open ${platform.toUpperCase()} and paste this link: ${shareUrl}`);
        navigator.clipboard.writeText(shareUrl);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      default:
        alert(`Sharing to ${platform} - Feature coming soon!`);
    }
    
    onClose();
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: '💚', color: 'bg-green-50 border-green-200 hover:bg-green-100', platform: 'whatsapp' },
    { name: 'Email', icon: '📧', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100', platform: 'email' },
    { name: 'Skype', icon: '💙', color: 'bg-sky-50 border-sky-200 hover:bg-sky-100', platform: 'skype' },
    { name: 'Instagram', icon: '📸', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100', platform: 'instagram' },
    { name: 'TikTok', icon: '🎵', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100', platform: 'tiktok' },
    { name: 'WPS Editor', icon: '📝', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100', platform: 'wps' },
    { name: 'Word Editor', icon: '📘', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100', platform: 'word' },
    { name: 'Copy Link', icon: '📋', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100', platform: 'copy' },
  ];

  return (
    <>
      {/* Backdrop - This ensures modal appears above everything */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none"
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Share File</h3>
              <p className="text-sm text-gray-600 truncate max-w-[250px]" title={file.original_name}>
                {file.original_name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl p-1"
            >
              ✕
            </button>
          </div>
          
          {/* Share Options Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option, index) => (
                <button 
                  key={index}
                  onClick={() => handleShare(option.platform)}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 hover:-translate-y-1 ${option.color}`}
                >
                  <span className="text-2xl mb-2">{option.icon}</span>
                  <span className="text-xs font-semibold text-gray-700">{option.name}</span>
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;