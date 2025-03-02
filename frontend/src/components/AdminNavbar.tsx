"use client"

import { useState, useEffect } from 'react'
import { Bell, Menu, Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Link, useLocation } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const [notifications] = useState([
    { id: 1, message: "New emergency call received" },
    { id: 2, message: "Dr. Sharma updated patient status" },
    { id: 3, message: "System maintenance scheduled" }
  ])
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  const isActive = (path: string) => location.pathname === path

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md py-2' 
          : 'bg-white/50 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <span className="font-bold text-lg">MedAdmin</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Link to="/admin-dashboard">
                      <Button 
                        variant={isActive('/admin-dashboard') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        Admin Dashboard
                      </Button>
                    </Link>
                    <Link to="/doctor-dashboard">
                      <Button 
                        variant={isActive('/doctor-dashboard') ? "default" : "ghost"} 
                        className="w-full justify-start"
                      >
                        Patient Records
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/admin-dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-bold text-lg hidden md:inline-block">MedAdmin</span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Added */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/admin-dashboard">
              <Button 
                variant={isActive('/admin-dashboard') ? "default" : "ghost"}
                className="font-medium"
              >
                Admin Dashboard
              </Button>
            </Link>
            <Link to="/doctor-dashboard">
              <Button 
                variant={isActive('/doctor-dashboard') ? "default" : "ghost"}
                className="font-medium"
              >
                Patient Records
              </Button>
            </Link>
          </div>
          
          {/* Search Bar - Hidden on Mobile */}
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search..." 
              className="pl-10 pr-4 bg-gray-100/80 border-0 focus-visible:ring-blue-500"
            />
          </div>
          
          {/* Right Side - Notifications and Profile */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {notifications.length}
                  </Badge>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    <Button variant="ghost" size="sm">Mark all as read</Button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <p>{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">Just now</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Avatar className="h-9 w-9 transition-transform hover:scale-110">
              <AvatarImage src="/placeholder.svg?height=36&width=36" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
