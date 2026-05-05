package et.scco.pms_backend.modules.planning.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import et.scco.pms_backend.modules.admin.model.Employee;
import et.scco.pms_backend.modules.admin.model.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "color_coding_details")
public class ColorCodingDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_coding_id")
    @JsonIgnore
    private ColorCoding colorCoding;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "submitted_by")
    // private User submittedBy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    @JsonIgnore
    private Employee submittedBy;

    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;

    @Column(name = "sender_feedback", length = 1000)
    private String senderFeedback;
    @Column(name = "reviewer_feedback", length = 1000)
    private String reviewerFeedback;

    // Relationship to hold multiple locations for this specific submission
    @OneToMany(mappedBy = "colorCodingDetails", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AchievementLocation> locations = new ArrayList<>();

    @PrePersist
    public void onCreate() { 
        this.submittedDate = LocalDateTime.now();
     }
}
