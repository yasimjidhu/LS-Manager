import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AuthService, type LoginCredentials, type CreateUserCredentials, type AuthResponse, type User } from '../../services/auth.service';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const token = localStorage.getItem('access_token');
const userStr = localStorage.getItem('user');

const initialState: AuthState = {
    user: userStr ? JSON.parse(userStr) : null,
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(credentials);
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (credentials: CreateUserCredentials, { rejectWithValue }) => {
        try {
            const response = await AuthService.register(credentials);
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await AuthService.logout();
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        restoreSession: (state) => {
            const token = localStorage.getItem('access_token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                state.token = token;
                state.user = JSON.parse(userStr);
                state.isAuthenticated = true;
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { restoreSession, clearError } = authSlice.actions;
export default authSlice.reducer;
