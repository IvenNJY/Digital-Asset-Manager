"use client"

import PrivateRoute from "@/components/auth/PrivateRoute"
import UsersTable from '@/components/UserManagement/UsersTable'
import Sidebar from '@/components/ui/Sidebar'
import Header from "@/components/ui/Header"



function UserManagementPage() {


  return (
    <PrivateRoute roles={['admin']} redirectTo="/dashboard">
      {(user) => (
        <Sidebar user={user}>
          <Header 
            title="User Management" 
            description="Manage application users and their roles." 
          />
          <UsersTable />
        </Sidebar>
      )}
    </PrivateRoute>
  )
}

export default UserManagementPage
