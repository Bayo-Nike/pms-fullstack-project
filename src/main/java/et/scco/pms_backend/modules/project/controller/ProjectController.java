package et.scco.pms_backend.modules.project.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import et.scco.pms_backend.modules.project.dto.request.ProjectRequestDTO;
import et.scco.pms_backend.modules.project.dto.response.ProjectResponseDTO;
import et.scco.pms_backend.modules.project.service.ProjectService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
 
     // Build Add Project REST API
    @PostMapping
    public ResponseEntity<ProjectResponseDTO>createProject(@RequestBody ProjectRequestDTO projectRequestDTO){
        ProjectResponseDTO savedProjectRequestDto=projectService.createProject(projectRequestDTO);
        return  new ResponseEntity<>(savedProjectRequestDto,HttpStatus.CREATED);
    }

    // Build Get Project REST API
    @GetMapping("{id}")
    public ResponseEntity<ProjectResponseDTO>getPermission(@PathVariable("id") Long projectId){
        ProjectResponseDTO projectResponseDTO=projectService.getProjectById(projectId);
        return ResponseEntity.ok(projectResponseDTO);

    }

    // Build Get All Projects REST API
    @GetMapping
    public ResponseEntity<List<ProjectResponseDTO>>getAllProjects(){
        List<ProjectResponseDTO> allProjectsDto=projectService.getAllProjects();
        return ResponseEntity.ok(allProjectsDto);

    }

    // Build Update Project REST API
    @PutMapping("{id}")
    public ResponseEntity<ProjectResponseDTO>updateProject(@PathVariable("id") Long projectId,@RequestBody ProjectRequestDTO projectRequestDTO){
        ProjectResponseDTO projectDtoResponseDTO=projectService.updateProject(projectId,projectRequestDTO);
        return ResponseEntity.ok(projectDtoResponseDTO);
    }
    // Build Delete Project REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteProject(@PathVariable("id") Long projectId){
        projectService.deleteProject(projectId);
        return ResponseEntity.ok("Project deleted successfully.");
    }
}
