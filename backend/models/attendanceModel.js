const { supabase } = require('../config/db');

const Attendance = {
    async create(attendanceData) {
        const { studentId, date, subject, session, status, markedBy } = attendanceData;
        const { data, error } = await supabase
            .from('attendance')
            .insert([{
                student_id: studentId,
                date,
                subject,
                session: session || 'Class 1',
                status,
                marked_by: markedBy
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async findByStudentAndDateRange(studentId, startDate, endDate) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
            .gte('date', startDate)
            .lte('date', endDate);
        if (error) throw error;
        return data;
    },

    async findByDateAndSession(date, session) {
        const { data, error } = await supabase
            .from('attendance')
            .select('student_id, status')
            .eq('date', date)
            .eq('session', session);
        if (error) throw error;
        return data;
    },

    async findDistinctDates() {
        const { data, error } = await supabase
            .from('attendance')
            .select('date')
            .order('date', { ascending: false });
        if (error) throw error;
        // Get unique dates
        const uniqueDates = [...new Set(data.map(d => d.date))];
        return uniqueDates;
    },

    async deleteMany() {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) throw error;
    },

    async bulkInsert(attendances) {
        const { data, error } = await supabase
            .from('attendance')
            .insert(attendances.map(a => ({
                student_id: a.studentId,
                date: a.date,
                subject: a.subject,
                session: a.session,
                status: a.status,
                marked_by: a.markedBy
            })))
            .select();
        if (error) throw error;
        return data;
    }
};

module.exports = Attendance;
