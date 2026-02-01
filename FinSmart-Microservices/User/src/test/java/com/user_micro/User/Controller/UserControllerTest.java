package com.user_micro.User.Controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import com.user_micro.User.Model.User;
import com.user_micro.User.Service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    // Prevent the real JWT filter (which depends on JwtUtil) from being instantiated in this slice test.
    @MockBean
    private com.user_micro.User.Security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(username = "testuser")
    void authenticatedProfileReturnsCurrentUser() throws Exception {
        User u = new User(1L, "First", "Last", "testuser", "test@example.com", "addr", "9876543210", "City", "State", "pass");
        when(userService.getUserByUsername("testuser")).thenReturn(u);

        mockMvc.perform(get("/api/users/profile").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @WithMockUser(username = "someone")
    void getUserByIdStillWorks() throws Exception {
        User u = new User(123L, "First", "Last", "bob", "bob@example.com", "addr", "9876543210", "City", "State", "pass");
        when(userService.getUserById(123L)).thenReturn(Optional.of(u));

        mockMvc.perform(get("/api/users/123").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(123))
                .andExpect(jsonPath("$.username").value("bob"));
    }
}
