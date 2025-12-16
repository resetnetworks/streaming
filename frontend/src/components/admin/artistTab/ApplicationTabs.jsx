import { 
  FaMusic, 
  FaMapMarkerAlt, 
  FaUserAlt, 
  FaEnvelope, 
  FaPhone,
  FaFileAlt,
  FaInstagram,
  FaYoutube,
  FaSpotify,
  FaFacebook,
  FaTwitter,
  FaTiktok,
  FaSoundcloud,
  FaApple,
  FaGlobe,
  FaLink
} from 'react-icons/fa';

const ApplicationTabs = ({ activeTab, application }) => {
  // Social platform icons mapping
  const socialIcons = {
    instagram: FaInstagram,
    youtube: FaYoutube,
    spotify: FaSpotify,
    facebook: FaFacebook,
    twitter: FaTwitter,
    tiktok: FaTiktok,
    soundcloud: FaSoundcloud,
    apple: FaApple,
    website: FaGlobe,
    default: FaLink
  };

  // Platform name formatting
  const getPlatformName = (provider) => {
    const names = {
      instagram: 'Instagram',
      youtube: 'YouTube',
      spotify: 'Spotify',
      facebook: 'Facebook',
      twitter: 'Twitter',
      tiktok: 'TikTok',
      soundcloud: 'SoundCloud',
      apple: 'Apple Music',
      website: 'Website',
    };
    return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  // Platform colors
  const getPlatformColor = (provider) => {
    const colors = {
      instagram: 'text-pink-500',
      youtube: 'text-red-500',
      spotify: 'text-green-500',
      facebook: 'text-blue-500',
      twitter: 'text-sky-500',
      tiktok: 'text-gray-800',
      soundcloud: 'text-orange-500',
      apple: 'text-rose-600',
      website: 'text-blue-400',
      default: 'text-gray-400'
    };
    return colors[provider] || 'text-blue-400';
  };

  // Safe access to adminNotes - ensure it's always an array
  const adminNotes = Array.isArray(application?.adminNotes) 
    ? application.adminNotes 
    : [];

  // Safe access to socials - ensure it's always an array
  const socials = Array.isArray(application?.socials) 
    ? application.socials 
    : [];

  // Safe access to documents - ensure it's always an array
  const documents = Array.isArray(application?.documents) 
    ? application.documents 
    : [];

  if (activeTab === 'overview') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artist Information */}
        <div className="bg-gray-900/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Artist Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaMusic className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Stage Name</p>
                <p className="text-white">{application?.stageName || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white">{application?.location || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaMusic className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Genre</p>
                <p className="text-white">{application?.genre || 'Not specified'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Bio / Description</p>
              <p className="text-white bg-gray-800/50 p-4 rounded-lg">
                {application?.bio || 'No bio provided'}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-gray-900/30 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">User Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaUserAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white">{application?.legalName || application?.user?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{application?.contact?.email || application?.user?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{application?.contact?.phone || application?.user?.phone || 'N/A'}</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-3">Social Links / Portfolio</p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                {socials.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {socials.map((social, index) => {
                      const IconComponent = socialIcons[social.provider] || socialIcons.default;
                      const platformName = getPlatformName(social.provider);
                      const iconColor = getPlatformColor(social.provider);
                      
                      return (
                        <a
                          key={social._id || index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800/70 transition-all duration-200 min-w-[100px] group"
                          title={`${platformName}: ${social.url}`}
                        >
                          <div className={`text-2xl ${iconColor} group-hover:scale-110 transition-transform duration-200`}>
                            <IconComponent />
                          </div>
                          <div className="text-center">
                            <p className="text-white text-sm font-medium">{platformName}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[80px]">
                              {social.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FaLink className="text-gray-600 text-2xl mx-auto mb-2" />
                    <p className="text-gray-400">No social links provided</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'history') {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Application History & Notes</h4>
        <div className="space-y-4">
          {adminNotes.length > 0 ? (
            adminNotes.map((note, index) => (
              <div key={note._id || index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-medium">{note.note || note.adminNotes || 'No note content'}</p>
                  <span className="text-xs text-gray-400">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'No date'}
                  </span>
                </div>
                {note.reason && (
                  <p className="text-sm text-gray-400 mt-2">
                    <span className="font-medium">Reason:</span> {note.reason}
                  </p>
                )}
                {note.status && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                      Status: {note.status}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No notes or history available</p>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'documents') {
    return (
      <div className="bg-gray-900/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Documents & Files</h4>
        <div className="space-y-4">
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <div key={doc._id || index} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{doc.name || `Document ${index + 1}`}</p>
                  <p className="text-sm text-gray-400">
                    Type: {doc.type || 'Unknown'} • 
                    Size: {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    View
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No documents uploaded</p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ApplicationTabs;