// BinaryTree.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  addEdge,
  BackgroundVariant,
  Position,
  Handle, // IMPORTANT: Import Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react'; // Added UserIcon
import { useAuth } from '../../context/AuthContext';

// Node component for the flow - defined outside to prevent re-renders
const UserNode = ({ data }) => {
  const { user, isRoot } = data;

  const getUserName = () => {
    if (user.personalInfo?.firstName && user.personalInfo?.lastName) {
      return `${user.personalInfo.firstName} ${user.personalInfo.lastName}`;
    }
    return user.username || user.email || 'Unknown User';
  };

  const getInitials = () => {
    const name = getUserName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine image source
  const userImage = user.personalInfo?.profileImage;
  const usePlaceholder = !userImage;

  return (
    <div className="relative">
      {/* TOP HANDLE - for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#555',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />

      <Card className={`w-80 ${isRoot ? 'border-2 border-blue-500 shadow-lg bg-blue-50' : 'border shadow-md bg-white'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {/* Conditional rendering for image or placeholder */}
            {usePlaceholder ? (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getInitials()}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                <img
                  src={userImage}
                  alt={`${getUserName()}'s profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.onerror = null; // Prevents infinite loop if fallback also fails
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    const initialsDiv = document.createElement('div');
                    initialsDiv.className = 'w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg';
                    initialsDiv.textContent = getInitials();
                    parent.appendChild(initialsDiv);
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {getUserName()}
              </CardTitle>
              <p className="text-sm text-gray-500 truncate">@{user.username || user.email?.split('@')[0]}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate">{user.email}</span>
            </div>
            {user.personalInfo?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user.personalInfo.phone}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div>
              <span className="text-xs text-gray-500">Rank</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {user.rank?.current || 'Bronze'}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-gray-500">Status</span>
              <Badge 
                variant={user.status === 'active' ? 'default' : 'secondary'} 
                className="ml-1 text-xs"
              >
                {user.status || 'pending'}
              </Badge>
            </div>
          </div>

          <div className="text-center pt-1 border-t">
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {user.memberId}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* BOTTOM HANDLE - for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#555',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />
    </div>
  );
};

// Define nodeTypes outside the component to prevent recreation
const nodeTypes = {
  userNode: UserNode,
};

const BinaryTreeComponent = () => {
  const { user: currentUser } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treeData, setTreeData] = useState(null);

  const fetchBinaryTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/v1/users/binary-tree', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch binary tree');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Build nodes and edges
  const buildNodesAndEdges = (tree, parentId = null, level = 0, index = 0) => {
    const calculateNodePosition = (level, index) => {
      const baseXSpacing = 350;
      const baseYSpacing = 250;
      
      const nodesAtLevel = Math.pow(2, level);
      const levelWidth = nodesAtLevel * baseXSpacing;
      const x = (index * baseXSpacing) - (levelWidth / 2) + (baseXSpacing / 2);
      const y = level * baseYSpacing;

      return { x, y };
    };

    if (!tree || !tree._id) {
      if (!parentId) {
        console.error("Root tree node is invalid or missing _id:", tree);
        setError("Invalid root node data received from server.");
        return { nodes: [], edges: [] };
      }
      return { nodes: [], edges: [] };
    }

    const nodeId = tree._id;
    const isRoot = !parentId;
    const nodePosition = calculateNodePosition(level, index);

    const node = {
      id: nodeId,
      type: 'userNode',
      position: nodePosition,
      data: { 
        user: tree, 
        isRoot 
      },
      width: 320,
      height: 200,
    };

    let allNodes = [node];
    let allEdges = [];

    if (parentId) {
      const edge = {
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        style: { 
          stroke: '#3b82f6',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
        },
        sourceHandle: 'bottom',
        targetHandle: 'top',
      };
      if (edge.source && edge.target) {
        allEdges.push(edge);
      }
    }

    if (tree.children && Array.isArray(tree.children)) {
      tree.children.forEach((child, childIndex) => {
        if (child && child._id) {
          const childIndexInLevel = (index * 2) + childIndex;
          const { nodes: childNodes, edges: childEdges } = buildNodesAndEdges(
            child, 
            nodeId,
            level + 1, 
            childIndexInLevel
          );
          allNodes = [...allNodes, ...childNodes];
          allEdges = [...allEdges, ...childEdges];
        }
      });
    }

    return { nodes: allNodes, edges: allEdges };
  };

  const loadTree = useCallback(async () => {
    const data = await fetchBinaryTree();
    if (data) {
      setTreeData(data);
    }
  }, [fetchBinaryTree]);

  useEffect(() => {
    if (treeData) {
      console.log("Tree data received:", treeData);
      
      const { nodes: treeNodes, edges: treeEdges } = buildNodesAndEdges(treeData);
      
      console.log("Generated Nodes:", treeNodes);
      console.log("Generated Edges:", treeEdges);

      if (treeNodes.length === 0) {
        setError('No valid user data found in the binary tree structure.');
        return;
      }
      
      setNodes(treeNodes);
      setEdges(treeEdges);
    }
  }, [treeData, setNodes, setEdges]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-600">Loading binary tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button onClick={loadTree} className="bg-blue-500 hover:bg-blue-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoizedNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { 
            stroke: '#3b82f6',
            strokeWidth: 2,
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#3b82f6',
          },
        }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

const BinaryTree = () => {
  return (
    <ReactFlowProvider>
      <BinaryTreeComponent />
    </ReactFlowProvider>
  );
};

export default BinaryTree;