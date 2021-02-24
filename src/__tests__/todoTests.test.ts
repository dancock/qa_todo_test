import {
  Builder,
  By,
  Capabilities,
  until,
  WebDriver,
} from "selenium-webdriver";

const chromedriver = require("chromedriver");
const driver: WebDriver = new Builder().withCapabilities(Capabilities.chrome()).build();

class TodoPage {
  todoInput: By = By.css("input.new-todo");
  todos: By = By.css("li.todo");
  todoLabel: By = By.css("label");
  todoComplete: By = By.css("input.toggle");
  clearCompletedButton: By = By.css("button.clear-completed");
  todoStar: By = By.css("span.star");
  todoStarred: By = By.css("span.starred");
  todoCount: By = By.css("span.todo-count");
  driver: WebDriver;
  url: string = "https://devmountain.github.io/qa_todos/";

  constructor(driver: WebDriver) {
    this.driver = driver;
  }
}

const tp = new TodoPage(driver);

beforeEach(async () => {
  await driver.get(tp.url);
});

it("can add a todo", async () => {
  await driver.wait(until.elementLocated(tp.todoInput));
  await driver.findElement(tp.todoInput).sendKeys("Test To-Do\n");
});

it("can remove a todo", async () => {
  let myTodos = await driver.findElements(tp.todos);

  await myTodos.filter(async (todo) => {
    (await (await todo.findElement(tp.todoLabel)).getText()) == "Test To-Do";
  })[0].findElement(tp.todoComplete).click();
  await (await driver.findElement(tp.clearCompletedButton)).click();
  myTodos = await driver.findElements(tp.todos);

  let myTodo = myTodos.filter(async (todo) => {
    (await (await todo.findElement(tp.todoLabel)).getText()) == "Test To-Do";
  });

  expect(myTodo.length).toEqual(0);
});

it("can mark a todo with a star", async () => {
  await driver.wait(until.elementLocated(tp.todoInput));

  let startingStars = (await driver.findElements(tp.todoStarred)).length;

  await driver.findElement(tp.todoInput).sendKeys("Test To-Do\n");
  await (await driver.findElements(tp.todos)).filter(async (todo) => {
    (await (await todo.findElement(tp.todoLabel)).getText()) == "Test To-Do";
  })[0].findElement(tp.todoStar).click();

  let endingStars = (await driver.findElements(tp.todoStarred)).length;

  expect(endingStars).toBeGreaterThan(startingStars);
});

it("has the right number of todos listed", async () => {
  await driver.wait(until.elementLocated(tp.todoInput));

  let startingTodoCount = (await driver.findElements(tp.todos)).length;

  await driver.findElement(tp.todoInput).sendKeys("Test To-Do 1\n");
  await driver.findElement(tp.todoInput).sendKeys("Test To-Do 2\n");
  await driver.findElement(tp.todoInput).sendKeys("Test To-Do 3\n");
  await driver.findElement(tp.todoInput).sendKeys("Test To-Do 4\n");
  await driver.findElement(tp.todoInput).sendKeys("Test To-Do 5\n");

  let endingTodoCount = (await driver.findElements(tp.todos)).length;
  let message = await (await driver.findElement(tp.todoCount)).getText();

  expect(endingTodoCount - startingTodoCount).toBe(5);
  expect(message).toBe(`${endingTodoCount} items left`);
});

afterAll(async () => {
  await driver.quit();
});