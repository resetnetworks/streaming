import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utills/axiosInstance.js';

// 👉 Register User
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await axios.post('/users/register', userData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (err) {
    console.log(err)
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 👉 Login User
export const loginUser = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const res = await axios.post('/users/login', userData);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 👉 Get My Profile
export const getMyProfile = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/users/me');
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    localStorage.removeItem('user');
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 👉 Logout User
export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    const res = await axios.post('/users/logout');
    localStorage.removeItem('user');
    return res.data.message;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 👉 Update Preferred Genres
export const updatePreferredGenres = createAsyncThunk(
  'auth/updatePreferredGenres',
  async (genres, thunkAPI) => {
    try {
      const res = await axios.put('/users/update-genres', { genres });
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.preferredGenres = res.data.preferredGenres;
      localStorage.setItem('user', JSON.stringify(user));
      return res.data.preferredGenres;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 👉 Initial User State
const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

// ✅ Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    status: 'idle',
    error: null,
    message: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
        state.message = 'Registered successfully';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
        state.message = 'Logged in successfully';
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(getMyProfile.rejected, (state) => {
        state.user = null;
        state.status = 'failed';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'succeeded';
        state.message = 'Logged out successfully';
      })
      .addCase(updatePreferredGenres.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updatePreferredGenres.fulfilled, (state, action) => {
        if (state.user) {
          state.user.preferredGenres = action.payload;
        }
        state.status = 'succeeded';
        state.message = 'Preferred genres updated successfully';
      })
      .addCase(updatePreferredGenres.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update preferred genres';
      })
      // 👉 Generic error handlers
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Something went wrong';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      );
  },
});

export const { clearMessage } = authSlice.actions;
export default authSlice.reducer;
