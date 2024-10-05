import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    birthDate: '',
    address: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill form with session data when available
  useEffect(() => {
    if (session?.user) {
      setUser({
        ...user,
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session]);

  // Handle input change
  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Validate address and check if within 50km of Paris
  const validateAddress = async (address) => {
    try {
      const response = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${address}`);
      const location = response.data.features[0]?.geometry?.coordinates;
      if (!location) throw new Error('Address not found');
      
      const distanceFromParis = calculateDistance(location, [2.3522, 48.8566]); // Paris coordinates
      return distanceFromParis <= 50;
    } catch (error) {
      console.error('Error validating address:', error);
      setError('Invalid address or address not within 50km of Paris.');
      return false;
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Validate the address
    const isValidAddress = await validateAddress(user.address);
    if (!isValidAddress) {
      setIsSubmitting(false);
      return;
    }

    try {
      // API call to update the user information
      const response = await axios.put('/api/user/update', {
        name: user.name,
        birthDate: user.birthDate,
        address: user.address,
        phoneNumber: user.phoneNumber,
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully.');
      } else {
        setError('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating the profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input name="name" value={user.name} onChange={handleInputChange} required />
      </div>

      <div>
        <label>Birth Date</label>
        <input name="birthDate" type="date" value={user.birthDate} onChange={handleInputChange} required />
      </div>

      <div>
        <label>Address</label>
        <input name="address" value={user.address} onChange={handleInputChange} required />
      </div>

      <div>
        <label>Phone Number</label>
        <input name="phoneNumber" value={user.phoneNumber} onChange={handleInputChange} required />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Update Profile'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default Profile;
