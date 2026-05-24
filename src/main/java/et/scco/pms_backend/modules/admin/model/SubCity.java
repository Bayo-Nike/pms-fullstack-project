package et.scco.pms_backend.modules.admin.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubCity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subCityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)

    @JsonIgnore
    private City city;

    @OneToMany(mappedBy = "subCity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Woreda> woredas = new ArrayList<>();
}