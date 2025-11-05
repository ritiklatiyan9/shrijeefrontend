// CompanyTree.jsx
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

const CompanyTreeComponent = () => {
  const { user: currentUser } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treeData, setTreeData] = useState(null);

  // Fetch the full company tree
  const fetchCompanyTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://13.127.229.155:5000/api/v1/users/company-tree', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch company tree');
      }

      const result = await response.json();
      if (result.data) {
        setTreeData(result.data);
      } else {
        setError('Invalid data structure received from server.');
      }
    } catch (err) {
      console.error("Error fetching company tree:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Build nodes and edges for the tree
  const buildNodesAndEdges = (tree, parentId = null, level = 0, index = 0) => {
   const calculateNodePosition = (level, index) => {
      // Increased spacing for better visual separation
      const baseXSpacing = 400; // Increased horizontal spacing
      const baseYSpacing = 350; // Significantly increased vertical spacing to prevent overlap
      
      // Calculate position based on level and index within the level
      const nodesAtThisLevel = Math.pow(2, level);
      const levelWidth = nodesAtThisLevel * baseXSpacing;
      // Center nodes within their level's width
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
    const isRoot = !parentId; // Root node has no parent
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

    // Add edge from parent to current node
    if (parentId) {
      const edge = {
        id: `edge-${parentId}-${nodeId}`,
        source: parentId, // Parent node ID
        target: nodeId,   // Current node ID
        type: 'default', // Changed to 'default' for curved lines
        style: { 
          stroke: '#3b82f6',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
        },
        sourceHandle: 'bottom', // Use defined handle IDs
        targetHandle: 'top',
      };
      if (edge.source && edge.target) {
        allEdges.push(edge);
      }
    }

    // Recursively process children
    if (tree.children && Array.isArray(tree.children)) {
      tree.children.forEach((child, childIndex) => {
        if (child && child._id) {
          // Calculate index for the child in its level
          const childIndexInLevel = (index * 2) + childIndex;
          const { nodes: childNodes, edges: childEdges } = buildNodesAndEdges(
            child, 
            nodeId, // Current node becomes the parent for its children
            level + 1, 
            childIndexInLevel // Pass the calculated index
          );
          allNodes = [...allNodes, ...childNodes];
          allEdges = [...allEdges, ...childEdges];
        }
      });
    }

    return { nodes: allNodes, edges: allEdges };
  };

  // Load the tree data on mount or when needed
  const loadTree = useCallback(async () => {
    await fetchCompanyTree(); // Fetch the data
  }, [fetchCompanyTree]);

  // Process the tree data into nodes and edges when it changes
  useEffect(() => {
    if (treeData) {
      console.log("Company Tree data received:", treeData);
      
      const { nodes: treeNodes, edges: treeEdges } = buildNodesAndEdges(treeData);
      
      console.log("Generated Nodes:", treeNodes);
      console.log("Generated Edges:", treeEdges);

      if (treeNodes.length === 0) {
        setError('No valid user data found in the company tree structure.');
        return;
      }
      
      setNodes(treeNodes);
      setEdges(treeEdges);
    }
  }, [treeData]);

  // Initial load
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
          <p className="mt-2 text-gray-600">Loading company tree...</p>
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
        // Increased padding, especially the top/bottom (y-axis) padding to account for vertical spacing
        fitViewOptions={{ 
          padding: 0.5, // Increased from 0.3 to 0.5
          minZoom: 0.1,
          maxZoom: 1.5,
        }}
        minZoom={0.1} // Allow more zooming out for large trees
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'default', // Changed default edge type to 'default' for curves
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

const CompanyTree = () => {
  return (
    <ReactFlowProvider>
      <CompanyTreeComponent />
    </ReactFlowProvider>
  );
};

export default CompanyTree;