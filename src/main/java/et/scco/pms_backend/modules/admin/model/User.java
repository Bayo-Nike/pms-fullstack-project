package et.scco.pms_backend.modules.admin.model;

import et.scco.pms_backend.enums.EmployeeStatus;
import et.scco.pms_backend.enums.PrincipalType;
import et.scco.pms_backend.enums.UserType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Login
    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    // SYSTEM or EMPLOYEE
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Enumerated(EnumType.STRING)
    @Column(name = "principal_type", nullable = false)
    private PrincipalType principalType = PrincipalType.USER;
    
    // USER -> Employee
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", unique = true)
    private Employee employee;

    // API_CLIENT -> ApiClient
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_client_id", unique = true)
    private ApiClient apiClient;
    

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Roles> roles = new HashSet<>();

    public EmployeeStatus getStatus() {
        return employee != null ? employee.getStatus() : null;
    }

    private Boolean mobileAllowed = false;
}