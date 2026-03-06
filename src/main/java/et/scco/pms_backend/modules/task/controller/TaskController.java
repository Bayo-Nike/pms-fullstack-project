package et.scco.pms_backend.modules.task.controller;

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

import et.scco.pms_backend.modules.task.dto.request.TaskRequestDTO;
import et.scco.pms_backend.modules.task.dto.response.TaskResponseDTO;
import et.scco.pms_backend.modules.task.service.TaskService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/task")
public class TaskController {
    private final TaskService taskService;

     // Build Add Task REST API
    @PostMapping
    public ResponseEntity<TaskResponseDTO>createTask(@RequestBody TaskRequestDTO taskRequestDTO){
        TaskResponseDTO savedTaskResponseDTO=taskService.createTask(taskRequestDTO);
        return  new ResponseEntity<>(savedTaskResponseDTO,HttpStatus.CREATED);

    }

    // Build Get Task REST API
    @GetMapping("{id}")
    public ResponseEntity<TaskResponseDTO>getTask(@PathVariable("id") Long taskId){
        System.out.println("================"+taskId);
        TaskResponseDTO taskResponseDTO=taskService.getTaskById(taskId);
        return ResponseEntity.ok(taskResponseDTO);

    }

    // Build Get All Tasks REST API
    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>>getAllTasks(){
        List<TaskResponseDTO> allTasksDto=taskService.getAllTasks();
        return ResponseEntity.ok(allTasksDto);

    }

    // Build Update Task REST API
    @PutMapping("{id}")
    public ResponseEntity<TaskResponseDTO>updateTask(@PathVariable("id") Long projectId,@RequestBody TaskRequestDTO taskRequestDTO){
         
        TaskResponseDTO taskResponseDTO=taskService.updatetask(projectId,taskRequestDTO);
        return ResponseEntity.ok(taskResponseDTO);

    }
    // Build Delete Task REST API
    @DeleteMapping("{id}")
    public ResponseEntity<String>deleteTask(@PathVariable("id") Long taskId){
         
        taskService.deleteTask(taskId);
        return ResponseEntity.ok("Task deleted successfully.");

    }
}
