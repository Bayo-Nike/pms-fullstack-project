package et.scco.pms_backend.modules.admin.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import et.scco.pms_backend.enums.Category;
import et.scco.pms_backend.enums.ClientStatus;
import et.scco.pms_backend.modules.task.model.Task;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
@Table(name = "clients")
public class Client {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Enumerated(EnumType.STRING)
    private ClientStatus status = ClientStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "document")
    private String document; // file name or path
 

    @ManyToOne()
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "registered_date")
    private LocalDateTime registeredDate;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    @ToString.Exclude // Prevents Infinite Loop
    private List<Employee> employees = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
    }

}
