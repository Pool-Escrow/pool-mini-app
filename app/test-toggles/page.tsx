"use client";

import { useState } from "react";

export default function TestTogglesPage() {
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [pageFollowRequired, setPageFollowRequired] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("4:45PM");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState("5:45PM");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Giveaway Requirements
          </h1>
          
          {/* Participant approval required toggle */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="approval-toggle" className="text-gray-800 font-medium">
                Participant approval required
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="approval-toggle" 
                  className="hidden"
                  checked={requiresApproval}
                  onChange={() => setRequiresApproval(!requiresApproval)}
                />
                <div className={`relative w-12 h-6 rounded-full transition-colors ${requiresApproval ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${requiresApproval ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Allow participants to register late?
            </p>
          </div>

          {/* Page follow required toggle */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="page-follow-toggle" className="text-gray-800 font-medium">
                Page follow required
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="page-follow-toggle" 
                  className="hidden"
                  checked={pageFollowRequired}
                  onChange={() => setPageFollowRequired(!pageFollowRequired)}
                />
                <div className={`relative w-12 h-6 rounded-full transition-colors ${pageFollowRequired ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${pageFollowRequired ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Require users to follow @partywithpool
            </p>
          </div>
          
          {/* Registration Time toggle */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="registration-toggle" className="text-gray-800 font-medium">
                Registration Time
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="registration-toggle" 
                  className="hidden"
                  checked={registrationEnabled}
                  onChange={() => setRegistrationEnabled(!registrationEnabled)}
                />
                <div className={`relative w-12 h-6 rounded-full transition-colors ${registrationEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${registrationEnabled ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Participants need to do this before this time
            </p>

            {registrationEnabled && (
              <div className="mt-6">
                {/* Registration Start */}
                <div className="mb-6">
                  <h3 className="text-gray-800 font-medium mb-2">Registration Start</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      />
                    </div>
                    <div className="flex-1">
                      <select 
                        className="bg-blue-500 text-white rounded-lg py-3 px-4 text-center w-full appearance-none"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      >
                        <option value="8:00AM">8:00AM</option>
                        <option value="9:00AM">9:00AM</option>
                        <option value="10:00AM">10:00AM</option>
                        <option value="11:00AM">11:00AM</option>
                        <option value="12:00PM">12:00PM</option>
                        <option value="1:00PM">1:00PM</option>
                        <option value="2:00PM">2:00PM</option>
                        <option value="3:00PM">3:00PM</option>
                        <option value="4:00PM">4:00PM</option>
                        <option value="4:45PM">4:45PM</option>
                        <option value="5:00PM">5:00PM</option>
                        <option value="6:00PM">6:00PM</option>
                        <option value="7:00PM">7:00PM</option>
                        <option value="8:00PM">8:00PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Registration End */}
                <div className="mb-6">
                  <h3 className="text-gray-800 font-medium mb-2">Registration End</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      />
                    </div>
                    <div className="flex-1">
                      <select 
                        className="bg-blue-500 text-white rounded-lg py-3 px-4 text-center w-full appearance-none"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      >
                        <option value="8:00AM">8:00AM</option>
                        <option value="9:00AM">9:00AM</option>
                        <option value="10:00AM">10:00AM</option>
                        <option value="11:00AM">11:00AM</option>
                        <option value="12:00PM">12:00PM</option>
                        <option value="1:00PM">1:00PM</option>
                        <option value="2:00PM">2:00PM</option>
                        <option value="3:00PM">3:00PM</option>
                        <option value="4:00PM">4:00PM</option>
                        <option value="5:00PM">5:00PM</option>
                        <option value="5:45PM">5:45PM</option>
                        <option value="6:00PM">6:00PM</option>
                        <option value="7:00PM">7:00PM</option>
                        <option value="8:00PM">8:00PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Create giveaway
          </button>
        </div>
      </div>
    </div>
  );
} 