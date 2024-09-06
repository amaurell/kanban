document.addEventListener('DOMContentLoaded', function () {
    const board = document.getElementById('board');
    const addColumnButton = document.getElementById('addColumn');
    const addTaskButton = document.getElementById('addTask');
    const resetBoardButton = document.getElementById('resetBoard');
    let taskId = 0;
  
    // Carregar dados do localStorage
    function loadBoard() {
      const savedBoard = JSON.parse(localStorage.getItem('kanbanBoard')) || [];
      savedBoard.forEach(column => addColumn(column));
    }
  
    // Adicionar nova coluna ao Kanban
    function addColumn(columnData = { title: 'Nova Coluna', tasks: [] }) {
      const columnElement = document.createElement('div');
      columnElement.classList.add('w-80', 'bg-gray-200', 'p-4', 'rounded-md', 'flex-shrink-0');
      columnElement.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">${columnData.title}</h2>
        <div class="tasks space-y-4 min-h-[200px]" id="col-${taskId}"></div>
      `;
  
      const tasksContainer = columnElement.querySelector('.tasks');
      columnData.tasks.forEach(task => addTask(tasksContainer, task));
  
      board.appendChild(columnElement);
      taskId++;
    }
  
    // Adicionar tarefa a uma coluna
    function addTask(tasksContainer, taskData) {
      const taskElement = document.createElement('div');
      taskElement.classList.add('bg-white', 'p-4', 'rounded-md', 'shadow-md', 'draggable', 'relative');
      taskElement.setAttribute('draggable', true);
      taskElement.innerHTML = `
        <p class="task-title">${taskData.title}</p>
        <span class="task-date">${taskData.createdAt}</span>
        <button class="edit-task bg-yellow-500 text-white px-2 py-1 rounded-md mt-2">Editar</button>
        <button class="delete-task bg-red-500 text-white px-2 py-1 rounded-md mt-2 ml-2">Excluir</button>
      `;
  
      // Eventos de arrastar
      taskElement.addEventListener('dragstart', dragStart);
      taskElement.addEventListener('dragend', dragEnd);
  
      // Evento de editar tarefa
      taskElement.querySelector('.edit-task').addEventListener('click', function () {
        const newTitle = prompt('Editar Tarefa:', taskElement.querySelector('.task-title').textContent);
        if (newTitle) {
          taskElement.querySelector('.task-title').textContent = newTitle;
          updateLocalStorage();
        }
      });
  
      // Evento de excluir tarefa
      taskElement.querySelector('.delete-task').addEventListener('click', function () {
        taskElement.remove();
        updateLocalStorage();
      });
  
      tasksContainer.appendChild(taskElement);
    }
  
    // Adicionar nova coluna
    addColumnButton.addEventListener('click', function () {
      const columnTitle = prompt('Nome da Coluna:');
      if (columnTitle) {
        const columnData = { title: columnTitle, tasks: [] };
        addColumn(columnData);
        updateLocalStorage();
      }
    });
  
    // Adicionar nova tarefa global
    addTaskButton.addEventListener('click', function () {
      const taskTitle = prompt('Nome da Tarefa:');
      if (taskTitle) {
        const firstColumn = board.querySelector('.tasks');
        if (firstColumn) {
          const taskData = { title: taskTitle, createdAt: new Date().toLocaleDateString('pt-BR') };
          addTask(firstColumn, taskData);
          updateLocalStorage();
        }
      }
    });
  
    // Resetar o Kanban Board
    resetBoardButton.addEventListener('click', function () {
      if (confirm('Tem certeza que deseja resetar o Kanban Board? Isso removerá todas as colunas e tarefas.')) {
        localStorage.removeItem('kanbanBoard');
        board.innerHTML = '';
      }
    });
  
    // Funções de drag & drop
    let draggedTask = null;
  
    function dragStart(event) {
      draggedTask = event.target;
      setTimeout(() => draggedTask.classList.add('invisible'), 0); // Esconde o card ao arrastar
    }
  
    function dragEnd(event) {
      setTimeout(() => {
        draggedTask.classList.remove('invisible');
        draggedTask = null; // Resetar referência após o drop
      }, 0);
    }
  
    // Para identificar onde o usuário deseja soltar a tarefa (acima ou abaixo de outra tarefa)
    function getDropPosition(event, task) {
      const bounding = task.getBoundingClientRect();
      const offset = event.clientY - bounding.top;
      return offset > bounding.height / 2 ? 'below' : 'above';
    }
  
    board.addEventListener('dragover', function (event) {
      event.preventDefault();
    });
  
    board.addEventListener('drop', function (event) {
      event.preventDefault();
      const dropTarget = event.target.closest('.tasks');
      const dropTask = event.target.closest('.draggable'); // Tarefa sobre a qual o card está sendo solto
  
      if (dropTarget && draggedTask) {
        if (dropTask) {
          const position = getDropPosition(event, dropTask);
          if (position === 'above') {
            dropTask.before(draggedTask); // Solta acima da tarefa alvo
          } else {
            dropTask.after(draggedTask); // Solta abaixo da tarefa alvo
          }
        } else {
          dropTarget.appendChild(draggedTask); // Se solto em uma área vazia
        }
        updateLocalStorage();
      }
    });
  
    // Atualizar o localStorage sempre que houver mudanças
    function updateLocalStorage() {
      const columns = [];
      document.querySelectorAll('.w-80').forEach(column => {
        const columnTitle = column.querySelector('h2').textContent;
        const tasks = [];
        column.querySelectorAll('.tasks > div').forEach(task => {
          tasks.push({ 
            title: task.querySelector('.task-title').textContent, 
            createdAt: task.querySelector('.task-date').textContent 
          });
        });
        columns.push({ title: columnTitle, tasks });
      });
      localStorage.setItem('kanbanBoard', JSON.stringify(columns));
    }
  
    // Carregar o quadro ao iniciar
    loadBoard();
  });
  