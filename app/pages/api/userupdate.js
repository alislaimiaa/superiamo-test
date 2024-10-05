export default async function handler(req, res) {
    if (req.method === 'PUT') {
      const { name, birthDate, address, phoneNumber } = req.body;
  
      try {
        // Update user in database (you need to write this logic)
        // Example: updateUserInDatabase(req.session.user.id, { name, birthDate, address, phoneNumber });
  
        res.status(200).json({ message: 'User updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }
  