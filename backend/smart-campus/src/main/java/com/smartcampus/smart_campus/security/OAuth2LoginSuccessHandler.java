package com.smartcampus.smart_campus.security;

import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.model.UserRole;
import com.smartcampus.smart_campus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        // User database එකේ නැත්නම් create කරන්න
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProfilePicture(picture);
                    newUser.setRole(UserRole.USER);
                    return userRepository.save(newUser);
                });

        // User ID frontend එකට pass කරන්න
        String redirectUrl = "http://localhost:3000/dashboard?userId="
                + user.getId() + "&name=" + name;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}