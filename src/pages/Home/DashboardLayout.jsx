// ============================================
// DashboardLayout.jsx - Updated with Separate Bookings & Plot Handling Section
// ============================================

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';


const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

// 🎨 Icons
import { FaHome, FaUsers, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaUserShield } from 'react-icons/fa';
import { GiFamilyTree, GiNetworkBars, GiRank3 } from 'react-icons/gi';
import { MdVerifiedUser, MdManageAccounts } from 'react-icons/md';
import { IoChevronDown } from 'react-icons/io5';
import { LetterText, Users as UsersIcon, FileCheck, Home } from 'lucide-react';

// Import the DashboardHome component
import DashboardHome from '../Dashboard/AdminDashboard';

function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const firstName = user?.personalInfo?.firstName || user?.firstName || 'User';
  const lastName = user?.personalInfo?.lastName || user?.lastName || '';
  const displayName = `${firstName} ${lastName}`.trim() || firstName;
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  const mainLinks = [];

  // 🧬 Genealogy Section
  const geneologySubItems = [
    { name: 'Genealogy Tree', path: '/dashboard/geneology-tree', icon: <GiFamilyTree className="text-green-600" /> },
    { name: 'Genealogy Left', path: '/dashboard/geneology-left', icon: <GiNetworkBars className="text-orange-500" /> },
    { name: 'Genealogy Right', path: '/dashboard/geneology-right', icon: <GiRank3 className="text-purple-600" /> },
    { name: 'All Members', path: '/dashboard/geneology-all', icon: <FaUsers className="text-teal-500" /> },
  ];
  const isGeneologySectionActive = geneologySubItems.some(item => location.pathname === item.path);

  // 👤 Profile Section
  const profileSubItems = [
    { name: 'My Profile', path: '/dashboard/profile', icon: <FaUserCircle className="text-indigo-500" /> },
    { name: 'KYC', path: '/dashboard/kyc', icon: <MdVerifiedUser className="text-emerald-600" /> },
    { name: 'Welcome Letter', path: '/dashboard/welcome-letter', icon: <LetterText className="text-red-500" /> },
    { name: 'My Geneology Tree', path: '/dashboard/my-users', icon: <FaTachometerAlt className="text-blue-500" /> },
  ];
  const isProfileSectionActive = profileSubItems.some(item => location.pathname === item.path);

  // 🧑‍💼 Admin Management (Admin-only)
  const adminSubItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt className="text-blue-500" /> },
    { name: 'User Management', path: '/dashboard/admin-user-management', icon: <UsersIcon className="text-purple-500" /> },
    { name: 'KYC Management', path: '/dashboard/admin-kyc-management', icon: <FileCheck className="text-green-500" /> },
    { name: 'Create Plots', path: '/dashboard/create-plot', icon: <MdManageAccounts className="text-red-500" /> },
    { name: 'Plot Booking Requests', path: '/dashboard/admin-plot-management', icon: <Home className="text-sky-500" /> },
    { name: 'Bookings', path: '/dashboard/admin-bookings', icon: <FaUserShield className="text-yellow-500" /> },
  ];
  const isAdminSectionActive = adminSubItems.some(item => location.pathname === item.path);

  // 🏗️ Bookings & Plots Section (Visible to all)
  const bookingsSubItems = [
    { name: 'Get Plots', path: '/dashboard/get-plots', icon: <Home className="text-sky-500" /> },
    { name: 'Left Team Bookings', path: '/dashboard/left-team-bookings', icon: <FaUserShield className="text-yellow-500" /> },
    { name: 'Right Team Bookings', path: '/dashboard/right-team-bookings', icon: <FaUserShield className="text-yellow-500" /> },
    { name: 'My Bookings', path: '/dashboard/my-bookings', icon: <FaUserShield className="text-yellow-500" /> },
  ];
  const isBookingsSectionActive = bookingsSubItems.some(item => location.pathname === item.path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-600">
            <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="font-bold text-sm text-gray-800">Shree Jee</h1>
            <p className="text-xs text-gray-500">Real Estate</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map(link => (
                <SidebarMenuItem key={link.path}>
                  <SidebarMenuButton asChild isActive={location.pathname === link.path} tooltip={link.name}>
                    <Link to={link.path}>
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* 🔐 Admin Management (Admin Only) */}
              {isAdmin && (
                <Collapsible defaultOpen={isAdminSectionActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Admin Management" isActive={isAdminSectionActive}>
                        <MdManageAccounts className="text-red-500" />
                        <span>Admin Management</span>
                        <IoChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {adminSubItems.map(sub => (
                          <SidebarMenuSubItem key={sub.path}>
                            <SidebarMenuSubButton asChild isActive={location.pathname === sub.path}>
                              <Link to={sub.path}>
                                {sub.icon}
                                <span>{sub.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* 🏗️ Bookings & Plot Handling */}
              <Collapsible defaultOpen={isBookingsSectionActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Bookings & Plots" isActive={isBookingsSectionActive}>
                      <FaUserShield className="text-yellow-600" />
                      <span>Bookings & Plots</span>
                      <IoChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {bookingsSubItems.map(sub => (
                        <SidebarMenuSubItem key={sub.path}>
                          <SidebarMenuSubButton asChild isActive={location.pathname === sub.path}>
                            <Link to={sub.path}>
                              {sub.icon}
                              <span>{sub.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 🧬 Genealogy Section */}
              <Collapsible defaultOpen={isGeneologySectionActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Genealogy" isActive={isGeneologySectionActive}>
                      <GiFamilyTree className="text-green-600" />
                      <span>Genealogy</span>
                      <IoChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {geneologySubItems.map(sub => (
                        <SidebarMenuSubItem key={sub.path}>
                          <SidebarMenuSubButton asChild isActive={location.pathname === sub.path}>
                            <Link to={sub.path}>
                              {sub.icon}
                              <span>{sub.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 👤 Profile Section */}
              <Collapsible defaultOpen={isProfileSectionActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Profile" isActive={isProfileSectionActive}>
                      <FaUserCircle className="text-indigo-500" />
                      <span>Profile</span>
                      <IoChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {profileSubItems.map(sub => (
                        <SidebarMenuSubItem key={sub.path}>
                          <SidebarMenuSubButton asChild isActive={location.pathname === sub.path}>
                            <Link to={sub.path}>
                              {sub.icon}
                              <span>{sub.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 🏠 Back to Home */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Home">
                  <Link to="/">
                    <FaHome className="text-sky-500" />
                    <span>Back to Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 👤 Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-600">
                {user?.personalInfo?.profileImage ? (
                  <img
                    src={user.personalInfo.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">{userInitial}</span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const firstName = user?.personalInfo?.firstName || user?.firstName || 'User';

  const sidebarLinks = [
    { name: 'Admin Dashboard', path: '/dashboard' },
    { name: 'User Management', path: '/dashboard/admin-user-management' },
    { name: 'KYC Management', path: '/dashboard/admin-kyc-management' },
    { name: 'Create Plot', path: '/dashboard/create-plot' },
    { name: 'Get Plots', path: '/dashboard/get-plots' },
    { name: 'Left Team Bookings', path: '/dashboard/left-team-bookings' },
    { name: 'Right Team Bookings', path: '/dashboard/right-team-bookings' },
    { name: 'My Bookings', path: '/dashboard/my-bookings' },
    { name: 'Genealogy Tree', path: '/dashboard/geneology-tree' },
    { name: 'Genealogy Left', path: '/dashboard/geneology-left' },
    { name: 'Genealogy Right', path: '/dashboard/geneology-right' },
    { name: 'All Members', path: '/dashboard/geneology-all' },
    { name: 'My Profile', path: '/dashboard/profile' },
    { name: 'KYC', path: '/dashboard/kyc' },
    { name: 'Welcome Letter', path: '/dashboard/welcome-letter' },
    { name: 'My Geneology Tree', path: '/dashboard/my-users' },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-600">Authentication error. Please log in again.</div>
      </div>
    );
  }

  const isDashboard = location.pathname === '/dashboard';

  return (
    <SidebarProvider>
      <div style={customFontStyle} className="flex w-full h-screen overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col w-full overflow-hidden">
          <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h2 className="text-xl font-semibold text-gray-800">
                  {sidebarLinks.find(link => link.path === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>

              <div className="hidden sm:block text-sm text-gray-600">
                Welcome back, <span className="font-medium">{firstName}</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
            {isDashboard ? <DashboardHome /> : <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
