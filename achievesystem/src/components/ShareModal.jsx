
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
    <>
      
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />
      
    
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none"
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
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
    </>
  );
};

export default ShareModal;*/





/*
import React from 'react';

const ShareModal = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const handleShare = (platform) => {
    // ... same handleShare function
  };

  // Platform data with actual logo image URLs
  const shareOptions = [
    { 
      name: 'WhatsApp', 
      color: '#25D366',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      platform: 'whatsapp' 
    },
    { 
      name: 'Email', 
      color: '#EA4335',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
      platform: 'email' 
    },
    { 
      name: 'Skype', 
      color: '#00AFF0',
      logo: 'https://cdn-icons-png.flaticon.com/512/2111/2111812.png',
      platform: 'skype' 
    },
    { 
      name: 'Instagram', 
      color: '#E4405F',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      platform: 'instagram' 
    },
    { 
      name: 'TikTok', 
      color: '#000000',
      logo: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
      platform: 'tiktok' 
    },
    { 
      name: 'WPS', 
      color: '#1A9CF7',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732220.png', // Using doc icon
      platform: 'wps' 
    },
    { 
      name: 'Word', 
      color: '#2B579A',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732220.png',
      platform: 'word' 
    },
    { 
      name: 'Copy', 
      color: '#6B7280',
      logo: 'https://cdn-icons-png.flaticon.com/512/1827/1827951.png',
      platform: 'copy' 
    },
  ];

  return (
    <>
    
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] backdrop-blur-sm"
        onClick={onClose}
      />
      
      
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
    
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-900">Share File</h3>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 text-sm truncate" title={file.original_name}>
              {file.original_name}
            </p>
          </div>
          
          
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {shareOptions.map((option, index) => (
                <button 
                  key={index}
                  onClick={() => handleShare(option.platform)}
                  className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 active:scale-95 group"
                  title={option.name}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform p-2">
                    <img 
                      src={option.logo} 
                      alt={option.name}
                      className="w-full h-full object-contain"
                      style={{ filter: option.color ? `drop-shadow(0 2px 4px ${option.color}40)` : 'none' }}
                      onError={(e) => {
                        // Fallback to colored circle if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="background-color: ${option.color}; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                            ${option.name.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
            
            
            <button 
              onClick={onClose}
              className="w-full mt-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;*/





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
        alert(`Share "${file.original_name}" to Instagram\n\nLink: ${shareUrl}`);
        navigator.clipboard.writeText(shareUrl);
        break;
      case 'tiktok':
        alert(`Share "${file.original_name}" to TikTok\n\nLink: ${shareUrl}`);
        navigator.clipboard.writeText(shareUrl);
        break;
      case 'wps':
        alert(`Open in WPS Office\n\nLink: ${shareUrl}`);
        navigator.clipboard.writeText(shareUrl);
        break;
      case 'word':
        alert(`Open in Microsoft Word\n\nLink: ${shareUrl}`);
        navigator.clipboard.writeText(shareUrl);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
      default:
        alert(`Sharing to ${platform}`);
    }
    
    onClose();
  };

  // Platform data with actual logo image URLs
  const shareOptions = [
    { 
      name: 'WhatsApp', 
      color: '#25D366',
      logo: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
      platform: 'whatsapp' 
    },
    { 
      name: 'Email', 
      color: '#EA4335',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
      platform: 'email' 
    },
    { 
      name: 'Skype', 
      color: '#00AFF0',
      logo: 'https://cdn-icons-png.flaticon.com/512/2111/2111812.png',
      platform: 'skype' 
    },
    { 
      name: 'Instagram', 
      color: '#E4405F',
      logo: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
      platform: 'instagram' 
    },
    { 
      name: 'TikTok', 
      color: '#000000',
      logo: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
      platform: 'tiktok' 
    },
    { 
      name: 'WPS', 
      color: '#1A9CF7',
      logo: 'https://cdn-icons-png.flaticon.com/512/281/281764.png',
      platform: 'wps' 
    },
    { 
      name: 'Word', 
      color: '#2B579A',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732220.png',
      platform: 'word' 
    },
    { 
      name: 'Copy', 
      color: '#6B7280',
      logo: 'https://cdn-icons-png.flaticon.com/512/1827/1827951.png',
      platform: 'copy' 
    },
  ];

  return (
    <>
      {/* Inline CSS *
      <style>{`
        /* Fix for viewport positioning 
        html.share-modal-open,
        body.share-modal-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Modal overlay - covers entire viewport *
        .share-modal-overlay-fixed {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background-color: rgba(0, 0, 0, 0.5) !important;
          z-index: 99998 !important;
          backdrop-filter: blur(2px);
          width: 100vw !important;
          height: 100vh !important;
        }
        
        /* Modal container - centered in viewport 
        .share-modal-container-fixed {
          position: fixed !important;
          top: 50vh !important; /* Use vh units 
          left: 50vw !important; /* Use vw units *
          transform: translate(-50%, -50%) !important;
          z-index: 99999 !important;
          width: 100% !important;
          max-width: 320px !important;
          padding: 0 16px !important;
          pointer-events: none !important;
        }
        
        /* Modal content *
        .share-modal-content-fixed {
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
          overflow: hidden !important;
          width: 100% !important;
          pointer-events: auto !important;
        }
        
        /* Platform logo sizing *
        .platform-logo-container-fixed {
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-bottom: 6px !important;
        }
        
        .platform-logo-img-fixed {
          width: 22px !important;
          height: 22px !important;
          object-fit: contain !important;
        }
        
        .platform-button-fixed {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          padding: 8px !important;
          border-radius: 10px !important;
          background: none !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .platform-button-fixed:hover {
          background-color: #f9fafb !important;
        }
        
        .platform-button-fixed:active {
          transform: scale(0.95) !important;
        }
        
        .platform-name-fixed {
          font-size: 10px !important;
          font-weight: 500 !important;
          color: #6b7280 !important;
          margin-top: 2px !important;
        }
        
        .share-modal-header-fixed {
          padding: 16px 20px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          background: linear-gradient(to right, #f9fafb, #ffffff) !important;
        }
        
        .share-modal-body-fixed {
          padding: 20px !important;
        }
        
        .platforms-grid-fixed {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 12px !important;
        }
        
        .cancel-button-fixed {
          width: 100% !important;
          padding: 14px !important;
          background-color: #f3f4f6 !important;
          color: #374151 !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: background-color 0.2s !important;
          margin-top: 24px !important;
        }
        
        .cancel-button-fixed:hover {
          background-color: #e5e7eb !important;
        }
        
        .close-button-fixed {
          background: none !important;
          border: none !important;
          color: #9ca3af !important;
          font-size: 20px !important;
          cursor: pointer !important;
          padding: 4px !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .close-button-fixed:hover {
          background-color: #f3f4f6 !important;
          color: #6b7280 !important;
        }
        
        .modal-title-fixed {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: #111827 !important;
          margin: 0 !important;
        }
        
        .file-name-fixed {
          font-size: 12px !important;
          color: #6b7280 !important;
          margin: 4px 0 0 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 220px !important;
        }
      `}</style>
      
      {/* Add class to body when modal is open 
      {isOpen && (
        <script dangerouslySetInnerHTML={{
          __html: `
            document.documentElement.classList.add('share-modal-open');
            document.body.classList.add('share-modal-open');
          `
        }} />
      )}
      
      {/* Remove class when modal closes 
      {!isOpen && isOpen !== null && (
        <script dangerouslySetInnerHTML={{
          __html: `
            document.documentElement.classList.remove('share-modal-open');
            document.body.classList.remove('share-modal-open');
          `
        }} />
      )}
      
      {/* Backdrop 
      <div 
        className="share-modal-overlay-fixed"
        onClick={onClose}
      />
      
      {/* Modal Container - Using vh/vw units 
      <div className="share-modal-container-fixed">
        <div className="share-modal-content-fixed">
          
          <div className="share-modal-header-fixed">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="modal-title-fixed">Share File</h3>
              <button 
                className="close-button-fixed"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <p className="file-name-fixed" title={file.original_name}>
              {file.original_name}
            </p>
          </div>
          
          {/* Platform Logos Grid 
          <div className="share-modal-body-fixed">
            <div className="platforms-grid-fixed">
              {shareOptions.map((option, index) => (
                <button 
                  key={index}
                  className="platform-button-fixed"
                  onClick={() => handleShare(option.platform)}
                  title={option.name}
                >
                  <div className="platform-logo-container-fixed">
                    <img 
                      src={option.logo} 
                      alt={option.name}
                      className="platform-logo-img-fixed"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            background-color: ${option.color}; 
                            width: 40px; 
                            height: 40px; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            color: white; 
                            font-weight: bold; 
                            font-size: 14px;
                          ">
                            ${option.name.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span className="platform-name-fixed">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Cancel Button 
            <button 
              className="cancel-button-fixed"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;*/


/*fall backon

import React, { useEffect, useState } from 'react';

const ShareModal = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  // Track mouse position when modal opens
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (isOpen) {
      // Store the click position
      const handleClick = (e) => {
        setClickPosition({ x: e.clientX, y: e.clientY });
      };
      
      // Add a slight delay to capture the click that opened the modal
      setTimeout(() => {
        document.addEventListener('click', handleClick, { once: true });
      }, 0);
      
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [isOpen]);

  // Calculate position for modal - ensure it stays within viewport
  const modalHeight = 450; // Approximate modal height
  const modalWidth = 350; // Approximate modal width (320 + padding)
  
  let top = clickPosition.y;
  let left = clickPosition.x;
  
  // Adjust if modal would go below viewport
  if (top + modalHeight > window.innerHeight) {
    top = window.innerHeight - modalHeight - 20;
  }
  
  // Adjust if modal would go beyond right edge
  if (left + modalWidth > window.innerWidth) {
    left = window.innerWidth - modalWidth - 20;
  }
  
  // Ensure minimum margins
  top = Math.max(90, top);
  left = Math.max(20, left);

  const modalStyle = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    transform: 'translate(0, 0)',
    zIndex: 9999,
    width: '100%',
    maxWidth: '320px',
    padding: '0 16px',
    animation: 'fadeIn 0.2s ease-out'
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleShare = (platform) => {
    const url = encodeURIComponent(file.url);
    const text = encodeURIComponent(`Check out this file: ${file.original_name}`);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      email: `mailto:?subject=${encodeURIComponent('Shared file')}&body=${text}%20${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      messenger: `https://www.facebook.com/dialog/send?link=${url}&app_id=123456789&redirect_uri=${encodeURIComponent(window.location.origin)}`,
      skype: `https://web.skype.com/share?url=${url}&text=${text}`,
      'facebook-messenger': `https://www.facebook.com/dialog/send?link=${url}&app_id=123456789&redirect_uri=${encodeURIComponent(window.location.origin)}`,
      gmail: `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent('Shared file')}&body=${text}%20${url}`,
      outlook: `https://outlook.office.com/owa/?path=/mail/action/compose&subject=${encodeURIComponent('Shared file')}&body=${text}%20${url}`,
      slack: `https://slack.com/intl/en-in/help/articles/209634107-Share-a-link-in-Slack`,
      discord: `https://discord.com/channels/@me`,
      teams: `https://teams.microsoft.com/share?href=${url}&msgText=${text}`,
      zoom: `https://zoom.us/`,
      wechat: `https://web.wechat.com/`,
      signal: `https://signal.me/`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(file.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert(`Share via: ${file.url}`));
    }
    
    onClose();
  };

  const shareOptions = [
    { platform: 'whatsapp', name: 'WhatsApp', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', color: '#25D366' },
    { platform: 'facebook', name: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', color: '#1877F2' },
    { platform: 'twitter', name: 'Twitter', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg', color: '#1DA1F2' },
    { platform: 'linkedin', name: 'LinkedIn', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', color: '#0A66C2' },
    { platform: 'telegram', name: 'Telegram', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', color: '#0088CC' },
    { platform: 'email', name: 'Email', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', color: '#EA4335' },
    { platform: 'reddit', name: 'Reddit', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Reddit_logo_new.svg', color: '#FF5700' },
    { platform: 'pinterest', name: 'Pinterest', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png', color: '#E60023' },
    { platform: 'messenger', name: 'Messenger', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Facebook_Messenger_4_Logo.svg', color: '#006AFF' },
    { platform: 'skype', name: 'Skype', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Skype_logo.svg', color: '#00AFF0' },
    { platform: 'gmail', name: 'Gmail', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', color: '#EA4335' },
    { platform: 'slack', name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg', color: '#4A154B' },
    { platform: 'discord', name: 'Discord', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Discord_logo.svg', color: '#5865F2' },
    { platform: 'teams', name: 'Teams', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg', color: '#6264A7' },
    { platform: 'zoom', name: 'Zoom', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg', color: '#2D8CFF' },
    { platform: 'wechat', name: 'WeChat', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/WeChat_logo.svg', color: '#07C160' }
  ];

  return (
    <>
  
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)'
        }}
        onClick={onClose}
      />
      
    
      <div 
        style={modalStyle}
      >
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(to right, #f9fafb, #ffffff)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                Share File
              </h3>
              <button 
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '4px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '220px'
            }} title={file.original_name}>
              {file.original_name}
            </p>
          </div>
          
          
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {shareOptions.map((option, index) => (
                <button 
                  key={index}
                  onClick={() => handleShare(option.platform)}
                  title={option.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px'
                  }}>
                    <img 
                      src={option.logo} 
                      alt={option.name}
                      style={{
                        width: '22px',
                        height: '22px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            background-color: ${option.color}; 
                            width: 40px; 
                            height: 40px; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            color: white; 
                            font-weight: bold; 
                            font-size: 14px;
                          ">
                            ${option.name.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
            
          
            <button 
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '24px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;
*/




import React, { useEffect, useState } from 'react';

const ShareModal = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  // Track mouse position when modal opens
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (isOpen) {
      // Store the click position
      const handleClick = (e) => {
        setClickPosition({ x: e.clientX, y: e.clientY + window.scrollY });
      };
      
      // Add a slight delay to capture the click that opened the modal
      setTimeout(() => {
        document.addEventListener('click', handleClick, { once: true });
      }, 0);
      
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [isOpen]);

  // Calculate position for modal - ensure it stays within viewport
  const modalHeight = 450; // Approximate modal height
  const modalWidth = 350; // Approximate modal width (320 + padding)
  
  // Use absolute positioning with scroll position
  let top = clickPosition.y;
  let left = clickPosition.x;
  
  // Adjust if modal would go below viewport (accounting for scroll)
  if (top + modalHeight > window.innerHeight + window.scrollY) {
    top = window.innerHeight + window.scrollY - modalHeight - 20;
  }
  
  // Adjust if modal would go beyond right edge
  if (left + modalWidth > window.innerWidth) {
    left = window.innerWidth - modalWidth - 20;
  }
  
  // Ensure minimum margins
  top = Math.max(window.scrollY + 20, top);
  left = Math.max(20, left);

  const modalStyle = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    transform: 'translate(0, 0)',
    zIndex: 9999,
    width: '100%',
    maxWidth: '320px',
    padding: '0 16px',
    animation: 'fadeIn 0.2s ease-out'
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      // Store scroll position in a data attribute for restoration
      document.body.setAttribute('data-modal-scroll', scrollY.toString());
      
      return () => {
        // Restore scrolling
        document.body.style.overflow = '';
        
        // Get the stored scroll position and restore it
        const savedScroll = document.body.getAttribute('data-modal-scroll');
        if (savedScroll) {
          window.scrollTo(0, parseInt(savedScroll, 10));
        }
        document.body.removeAttribute('data-modal-scroll');
      };
    }
  }, [isOpen]);

  const handleShare = (platform) => {
    const url = encodeURIComponent(file.url);
    const text = encodeURIComponent(`Check out this file: ${file.original_name}`);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      email: `mailto:?subject=${encodeURIComponent('Shared file')}&body=${text}%20${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      messenger: `https://www.facebook.com/dialog/send?link=${url}&app_id=123456789&redirect_uri=${encodeURIComponent(window.location.origin)}`,
      skype: `https://web.skype.com/share?url=${url}&text=${text}`,
      'facebook-messenger': `https://www.facebook.com/dialog/send?link=${url}&app_id=123456789&redirect_uri=${encodeURIComponent(window.location.origin)}`,
      gmail: `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent('Shared file')}&body=${text}%20${url}`,
      outlook: `https://outlook.office.com/owa/?path=/mail/action/compose&subject=${encodeURIComponent('Shared file')}&body=${text}%20${url}`,
      slack: `https://slack.com/intl/en-in/help/articles/209634107-Share-a-link-in-Slack`,
      discord: `https://discord.com/channels/@me`,
      teams: `https://teams.microsoft.com/share?href=${url}&msgText=${text}`,
      zoom: `https://zoom.us/`,
      wechat: `https://web.wechat.com/`,
      signal: `https://signal.me/`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(file.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert(`Share via: ${file.url}`));
    }
    
    onClose();
  };

  const shareOptions = [
    { platform: 'whatsapp', name: 'WhatsApp', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', color: '#25D366' },
    { platform: 'facebook', name: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', color: '#1877F2' },
    { platform: 'twitter', name: 'Twitter', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg', color: '#1DA1F2' },
    { platform: 'linkedin', name: 'LinkedIn', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', color: '#0A66C2' },
    { platform: 'telegram', name: 'Telegram', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', color: '#0088CC' },
    { platform: 'email', name: 'Email', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', color: '#EA4335' },
    { platform: 'reddit', name: 'Reddit', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Reddit_logo_new.svg', color: '#FF5700' },
    { platform: 'pinterest', name: 'Pinterest', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png', color: '#E60023' },
    { platform: 'messenger', name: 'Messenger', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Facebook_Messenger_4_Logo.svg', color: '#006AFF' },
    { platform: 'skype', name: 'Skype', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Skype_logo.svg', color: '#00AFF0' },
    { platform: 'gmail', name: 'Gmail', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', color: '#EA4335' },
    { platform: 'slack', name: 'Slack', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg', color: '#4A154B' },
    { platform: 'discord', name: 'Discord', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Discord_logo.svg', color: '#5865F2' },
    { platform: 'teams', name: 'Teams', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg', color: '#6264A7' },
    { platform: 'zoom', name: 'Zoom', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg', color: '#2D8CFF' },
    { platform: 'wechat', name: 'WeChat', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/WeChat_logo.svg', color: '#07C160' }
  ];

  return (
    <>
      {/* Backdrop - also changed to absolute */}
      
      
      {/* Modal positioned near the click */}
      <div 
        style={modalStyle}
      >
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(to right, #f9fafb, #ffffff)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                Share File
              </h3>
              <button 
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '4px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '220px'
            }} title={file.original_name}>
              {file.original_name}
            </p>
          </div>
          
          {/* Platform Grid */}
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {shareOptions.map((option, index) => (
                <button 
                  key={index}
                  onClick={() => handleShare(option.platform)}
                  title={option.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px'
                  }}>
                    <img 
                      src={option.logo} 
                      alt={option.name}
                      style={{
                        width: '22px',
                        height: '22px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            background-color: ${option.color}; 
                            width: 40px; 
                            height: 40px; 
                            border-radius: 50%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            color: white; 
                            font-weight: bold; 
                            font-size: 14px;
                          ">
                            ${option.name.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Cancel Button */}
            <button 
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '24px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;
