import React from 'react';
import { Student } from '@/src/app/api/check-in/route'; // Import the shared type

interface StudentListItemProps {
  student: Student;
}

const StudentListItem: React.FC<StudentListItemProps> = ({ student }) => {
  // Format the ISO timestamp into a readable time (e.g., 10:30 AM)
  const formattedTime = new Date(student.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-full flex items-center space-x-4 transition-transform hover:scale-[1.02] hover:shadow-md">
      {/* Profile Initial */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-500">
          {student.name.charAt(0)}
        </span>
      </div>

      {/* Student Details Grid */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-semibold text-gray-800">{student.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Roll Number</p>
          <p className="font-semibold text-gray-800">{student.rollNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-semibold text-gray-800">{student.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Branch</p>
          <p className="font-semibold text-gray-800">{student.branch}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Group</p>
          <p className="font-semibold text-gray-800">{student.group}</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm text-gray-500">Checked In</p>
        <p className="font-bold text-lg text-blue-600">{formattedTime}</p>
      </div>
    </div>
  );
};

export default StudentListItem;