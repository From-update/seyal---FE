'use client';

import React from 'react';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  ChevronDown,
  UserCheck,
  BarChart3,
  Users,
  Layers,
} from 'lucide-react';
import { SeyalLogo } from './SeyalLogo';

export interface DashboardShowcaseProps {
  userRole?: string;
  welcomeSubtitle?: string;
  showMobile?: boolean;
}

export function DashboardShowcase({
  userRole = 'GM',
  welcomeSubtitle = "Here's an overview of your team's work and progress.",
  showMobile = true,
}: DashboardShowcaseProps) {
  return (
    <div className="relative w-full max-w-[440px] xl:max-w-[480px] mx-auto flex flex-col items-center select-none">
      {/* Glow Ambient behind mockups */}
      <div className="absolute -top-10 -left-10 w-60 h-60 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-64 h-64 bg-[#064B3B]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Mockup Composition Container */}
      <div className="relative w-full">
        {/* ================= LAPTOP MOCKUP ================= */}
        <div className="relative mx-auto w-full rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 p-2 pt-2.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] border border-neutral-700/60">
          {/* Laptop Camera notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neutral-950 flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-emerald-500/40" />
          </div>

          {/* Laptop Screen */}
          <div className="rounded-xl bg-[#F8FAFC] overflow-hidden border border-neutral-200/40 text-neutral-800 shadow-inner">
            {/* Top Bar inside Screen */}
            <div className="h-7 sm:h-8 bg-white border-b border-neutral-200/80 px-2.5 sm:px-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-2.5">
                <SeyalLogo size="sm" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#08745B] border-b-2 border-[#08745B] pb-0.5 pt-1 px-1">
                  Dashboard
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-500">
                  Tasks
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-500 hidden sm:inline">
                  Reports
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <Bell className="w-2.5 h-2.5" />
                </div>
                <div className="flex items-center space-x-0.5 pl-0.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#08745B] to-[#119875] text-[9px] font-bold text-white flex items-center justify-center">
                    GM
                  </div>
                  <ChevronDown className="w-2 h-2 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Content Area inside Screen */}
            <div className="p-2 sm:p-2.5 space-y-2">
              {/* Welcome text */}
              <div>
                <h4 className="text-[11px] sm:text-[12px] font-bold text-neutral-900 leading-tight">
                  Welcome, {userRole} 👋
                </h4>
                <p className="text-[9px] text-neutral-500 leading-tight">
                  {welcomeSubtitle}
                </p>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-4 gap-1.5">
                {/* Total Tasks */}
                <div className="bg-white rounded-lg p-1.5 border border-neutral-200/80 shadow-2xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FolderKanban className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8px] text-neutral-500 font-medium truncate">Total</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5 pl-0.5">128</div>
                </div>

                {/* In Progress */}
                <div className="bg-white rounded-lg p-1.5 border border-neutral-200/80 shadow-2xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Clock className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8px] text-neutral-500 font-medium truncate">Progress</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5 pl-0.5">46</div>
                </div>

                {/* Completed */}
                <div className="bg-white rounded-lg p-1.5 border border-neutral-200/80 shadow-2xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8px] text-neutral-500 font-medium truncate">Done</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5 pl-0.5">72</div>
                </div>

                {/* Overdue */}
                <div className="bg-white rounded-lg p-1.5 border border-neutral-200/80 shadow-2xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertTriangle className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[8px] text-neutral-500 font-medium truncate">Overdue</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5 pl-0.5">10</div>
                </div>
              </div>

              {/* Lower Section: Task Progress & Recent Assignments */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {/* Donut Chart Progress (2 cols) */}
                <div className="col-span-2 bg-white rounded-lg p-1.5 sm:p-2 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-semibold text-neutral-800">Task Progress</span>
                  <div className="flex items-center justify-center my-0.5 relative">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-100"
                        stroke="currentColor"
                        strokeWidth="3.6"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#10B981]"
                        stroke="currentColor"
                        strokeDasharray="56, 100"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[10px] sm:text-xs font-bold text-neutral-800">56%</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-[7.5px] sm:text-[8px] text-neutral-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#10B981]" /> Completed
                      </span>
                      <span className="font-semibold text-neutral-800">72</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-cyan-500" /> Progress
                      </span>
                      <span className="font-semibold text-neutral-800">46</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500" /> Overdue
                      </span>
                      <span className="font-semibold text-neutral-800">10</span>
                    </div>
                  </div>
                </div>

                {/* Recent Assignments Table (3 cols) */}
                <div className="col-span-3 bg-white rounded-lg p-1.5 sm:p-2 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-semibold text-neutral-800">Recent Assignments</span>
                  <div className="space-y-1 mt-0.5 text-[8px] sm:text-[8.5px]">
                    <div className="flex items-center justify-between py-0.5 border-b border-neutral-100">
                      <span className="text-neutral-700 truncate max-w-[95px] flex items-center gap-1">
                        <span>📋</span> CCTV Integration
                      </span>
                      <span className="px-1 py-0.2 rounded text-[7.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 border-b border-neutral-100">
                      <span className="text-neutral-700 truncate max-w-[95px] flex items-center gap-1">
                        <span>📋</span> NextUp UI Changes
                      </span>
                      <span className="px-1 py-0.2 rounded text-[7.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 border-b border-neutral-100">
                      <span className="text-neutral-700 truncate max-w-[95px] flex items-center gap-1">
                        <span>📋</span> AI Chatbot Training
                      </span>
                      <span className="px-1 py-0.2 rounded text-[7.5px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-neutral-700 truncate max-w-[95px] flex items-center gap-1">
                        <span>📋</span> 15 Days Report
                      </span>
                      <span className="px-1 py-0.2 rounded text-[7.5px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base and Hinge */}
          <div className="h-2 w-full bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-600 rounded-b-xl mt-0.5 flex justify-center items-center shadow-md">
            <div className="w-12 h-0.5 bg-neutral-700/80 rounded-full" />
          </div>
        </div>

        {/* ================= MOBILE PHONE MOCKUP (Overlapping Left) ================= */}
        {showMobile && (
          <div className="absolute -bottom-3 -left-3 w-28 sm:w-32 rounded-xl bg-neutral-900 p-1 shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-2 border-neutral-700/70 hidden sm:block">
            {/* Speaker notch */}
            <div className="w-6 h-0.5 bg-neutral-800 rounded-full mx-auto mb-0.5" />

            {/* Phone Screen */}
            <div className="rounded-lg bg-white p-1.5 text-neutral-800 shadow-inner">
              <div className="flex items-center space-x-1 mb-1">
                <SeyalLogo size="sm" showText={false} />
                <span className="text-[8px] font-bold text-neutral-900">SEYAL</span>
              </div>

              <div className="mb-1.5">
                <div className="text-[9px] font-bold text-neutral-900 leading-tight">Hi, Manager 👋</div>
                <div className="text-[7px] text-neutral-500">Track and manage your work.</div>
              </div>

              <div className="space-y-0.5 mb-1.5">
                <div className="bg-[#EDF6F1] px-1 py-0.5 rounded flex items-center justify-between text-[7px]">
                  <span className="text-neutral-600 font-medium">My Tasks</span>
                  <span className="font-bold text-[#08745B]">24</span>
                </div>
                <div className="bg-cyan-50 px-1 py-0.5 rounded flex items-center justify-between text-[7px]">
                  <span className="text-neutral-600 font-medium">Progress</span>
                  <span className="font-bold text-cyan-700">11</span>
                </div>
                <div className="bg-emerald-50 px-1 py-0.5 rounded flex items-center justify-between text-[7px]">
                  <span className="text-neutral-600 font-medium">Completed</span>
                  <span className="font-bold text-emerald-700">09</span>
                </div>
                <div className="bg-rose-50 px-1 py-0.5 rounded flex items-center justify-between text-[7px]">
                  <span className="text-neutral-600 font-medium">Overdue</span>
                  <span className="font-bold text-rose-700">04</span>
                </div>
              </div>

              {/* Mini nav */}
              <div className="h-4 bg-neutral-100 rounded flex items-center justify-around text-neutral-500 text-[9px]">
                <span>📋</span>
                <span>➕</span>
                <span>📊</span>
                <span>👤</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM FEATURE HIGHLIGHTS ================= */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full mt-3 xl:mt-4 pt-2.5 border-t border-emerald-700/40 text-center">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 flex items-center justify-center mb-1 shadow-2xs">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-50">Assign Work</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 flex items-center justify-center mb-1 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-50">Track Progress</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 flex items-center justify-center mb-1 shadow-2xs">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-50">Generate Reports</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 flex items-center justify-center mb-1 shadow-2xs">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-50">Manage Teams</span>
        </div>
      </div>
    </div>
  );
}
