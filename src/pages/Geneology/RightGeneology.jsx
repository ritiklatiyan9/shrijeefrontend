import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users, Calendar, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GeneologyRight = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Recursively flatten the genealogy structure
  const flattenGenealogy = (node, level = 0) => {
    if (!node) return [];
    const current = {
      id: node._id,
      name:
        `${node.personalInfo?.firstName || ''} ${node.personalInfo?.lastName || ''}`.trim() ||
        node.username,
      email: node.email,
      phone: node.personalInfo?.phone || '',
      position: node.position,
      createdAt: node.createdAt,
      status: node.status,
      memberId: node.memberId,
      level,
    };
    const children = (node.children || []).flatMap((child) =>
      flattenGenealogy(child, level + 1)
    );
    return [current, ...children];
  };

  // Fetch genealogy data
  useEffect(() => {
    const fetchRightGenealogy = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/v1/users/right-genealogy', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch genealogy data');

        const flattened = flattenGenealogy(data.data);
        setUsers(flattened);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRightGenealogy();
  }, []);

  // Filter users by search term
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Right Genealogy</CardTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {'‣ '.repeat(u.level) + (u.name || '—')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {u.email || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {u.phone || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.position}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      u.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>{u.memberId || '—'}</TableCell>
                <TableCell>{u.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GeneologyRight;
