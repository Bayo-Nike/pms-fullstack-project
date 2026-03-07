package et.scco.pms_backend.modules.admin.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@Entity
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String action; //create, updated and deleted
    private String performedBy;
    private LocalDateTime timestamp;
    private String details;

    public AuditLog() {
        this.timestamp = java.time.LocalDateTime.now();
    }
}
