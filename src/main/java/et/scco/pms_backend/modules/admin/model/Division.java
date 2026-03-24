package et.scco.pms_backend.modules.admin.model;

import et.scco.pms_backend.enums.DivisionGroup;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"name", "parent_id"}
        )
)
public class Division {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DivisionGroup divisionGroup;

    // Parent Division
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Division parent;

    // Child Divisions
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Division> children = new ArrayList<>();
}