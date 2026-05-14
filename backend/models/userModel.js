const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

const User = {
    async create(userData) {
        const { name, email, password, role, rollNumber, subject } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                password: hashedPassword,
                role: role || 'student',
                roll_number: rollNumber,
                subject
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
        return data;
    },

    async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async findByRollNumber(rollNumber) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('roll_number', rollNumber)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async findAllStudents() {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, roll_number, stats:attendance(count)')
            .eq('role', 'student');
        if (error) throw error;
        return data;
    },

    async deleteMany() {
        const { error } = await supabase
            .from('users')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) throw error;
    },

    matchPassword: async function (enteredPassword, hashedPassword) {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    }
};

module.exports = User;
