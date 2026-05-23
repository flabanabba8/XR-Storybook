export class StoryManager {
  constructor() {
    this.stories = [];
    this.currentStory = null;
    this.currentSceneIndex = -1;
    this.listeners = [];
  }

  async load() {
    const response = await fetch('story/stories.json');
    if (!response.ok) {
      throw new Error(`Failed to load stories: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    this.stories = data.stories;
  }

  getStoryList() {
    return this.stories.map(s => ({ id: s.id, title: s.title, description: s.description }));
  }

  startStory(storyId) {
    this.currentStory = this.stories.find(s => s.id === storyId);
    if (!this.currentStory) return null;
    this.currentSceneIndex = 0;
    this.emit('scenechange', this.getCurrentScene());
    return this.getCurrentScene();
  }

  getCurrentScene() {
    if (!this.currentStory || this.currentSceneIndex < 0) return null;
    return {
      ...this.currentStory.scenes[this.currentSceneIndex],
      storyTitle: this.currentStory.title,
      sceneNumber: this.currentSceneIndex + 1,
      totalScenes: this.currentStory.scenes.length
    };
  }

  nextScene() {
    if (!this.currentStory) return null;
    if (this.currentSceneIndex >= this.currentStory.scenes.length - 1) return null;
    this.currentSceneIndex++;
    const scene = this.getCurrentScene();
    this.emit('scenechange', scene);
    return scene;
  }

  prevScene() {
    if (!this.currentStory) return null;
    if (this.currentSceneIndex <= 0) return null;
    this.currentSceneIndex--;
    const scene = this.getCurrentScene();
    this.emit('scenechange', scene);
    return scene;
  }

  hasNext() {
    return this.currentStory && this.currentSceneIndex < this.currentStory.scenes.length - 1;
  }

  hasPrev() {
    return this.currentStory && this.currentSceneIndex > 0;
  }

  addStory(story) {
    // Avoid duplicates
    if (!this.stories.find(s => s.id === story.id)) {
      this.stories.push(story);
    }
  }

  exitStory() {
    this.currentStory = null;
    this.currentSceneIndex = -1;
    this.emit('storyexit');
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  emit(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        listener.callback(data);
      }
    }
  }
}
