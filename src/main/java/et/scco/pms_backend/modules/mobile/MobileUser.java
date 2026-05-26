package et.scco.pms_backend.modules.mobile;

import et.scco.pms_backend.modules.admin.model.Employee;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class MobileUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Employee employee;

    private String deviceInfo;
    private String userCode; // Unique generated string
    private LocalDateTime registrationDate = LocalDateTime.now();
    private String status = "ACTIVE"; // ACTIVE, REVOKED
}