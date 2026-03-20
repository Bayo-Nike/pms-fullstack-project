package et.scco.pms_backend.modules.admin.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String owner;
    private String receiver;
    private String message;
    private String notificationUrl;
    private LocalDateTime createdAt;
    private boolean deleted = false;

    @PrePersist
    void createdAt(){
        createdAt = LocalDateTime.now();
    }
}
