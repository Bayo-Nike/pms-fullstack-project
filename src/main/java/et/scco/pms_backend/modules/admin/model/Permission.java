package et.scco.pms_backend.modules.admin.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Data
public class Permission {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String slug;
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @ManyToMany(mappedBy = "permissions")
    private List<Roles> roles;
}
