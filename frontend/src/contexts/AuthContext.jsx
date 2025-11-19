import React, { createContext, useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    useEffect(() =>{
        if (!token) {
            setUser(null);
            return;
        }

        fetch(`${VITE_BACKEND_URL}/user/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
        .then(async (response) => {
            const body = await response.json();

            if (!response.ok) {
                throw new Error(body.message || "Login failed");
            }
            return body;
        })
        .then((data) => {
            setToken(token);
            localStorage.setItem("token", token);
            setUser(data.user);
        })
        .catch((error) => {
            console.error("Error fetching user data:", error);
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
        });
    }, [token])

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        setToken(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        return fetch(`${VITE_BACKEND_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
        .then(async (response) => {
            const body = await response.json();

            if (!response.ok) {
                throw new Error(body.message || "Login failed");
            }
            return body;
        })
        .then((data) => {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            navigate("/profile");
            return "";
        })
        .catch((error) => {
            console.error("Error during login:", error);
            return error.message;
        });
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (userData) => {
        return fetch(`${VITE_BACKEND_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({...userData}),
        })
        .then(async (response) => {
            if (response.ok) {
                navigate("/success");
                return "";
            } else {
                const body = await response.json();
                throw new Error(body.message || "Registration failed");
            }
        })
        .catch((error) => {
            console.error("Error during registration:", error);
            return error.message;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
