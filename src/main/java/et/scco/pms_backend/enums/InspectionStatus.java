package et.scco.pms_backend.enums;

public enum InspectionStatus {
    SUBMITTED_BY_SE,        // Step 1: Only Teaam Leader sees it
    APPROVED_BY_TL,        // Step 2: Team Leader and Director see it
    APPROVED_BY_DIRECTOR  // Step 3: Team Leader, Director, and Office Head see it

}
