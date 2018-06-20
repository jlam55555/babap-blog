/**
  * Util helper functions:
  * - mixed get(string url, boolean json=true)
  */
function get(url, callback, json = true) {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      callback(json ? JSON.parse(this.responseText) : this.responseText);
    }
  };
  req.open('GET', url, true);
  req.send();
}

/**
  * component for posts page (list)
  */
let PostsComponent = {
  template: `<div id='container'>
  <div v-if='posts.length == 0'>Loading&hellip;</div>
  <div v-else>
    <a class='post-item' v-for='post in posts' v-bind:href='"/posts/" + post.path'>
      <div>Title: {{ post.title }}</div>
      <div>Post id: {{ post.id }}</div>
      <div>Description: {{ post.description }}</div>
      <div>Path: {{ post.path }}</div>
      <div>Path: {{ post.hits }}</div>
    </a>
  </div>
</div>`,
  data() {
    return {
      posts: []
    };
  },
  created() {
    // get post data
    get('/scripts/getPostList.php', postData => {
      this.posts = postData;
    });
  }
};

/**
  * component for post page
  */
let PostComponent = {
  template: `<div id='container'>
  POST: {{ postName }}
  <div v-if='postMetadata == null'>Loading&hellip;</div>
  <div v-else-if='postMetadata.error'>
    Error: {{ postMetadata.error  }}
  </div>
  <div v-else v-html='postBody'></div>
  <div>
    <a href='/'>Return home.</a>
  </div>
</div>`,
  data() {
    return {
      postName: window.location.pathname.toLowerCase().match(/\/posts\/([a-z\-]+)/)[1] || null,
      postMetadata: null,
      postBody: null,
      converter: new showdown.Converter()
    };
  },
  created() {
    get('/scripts/getPostData.php?postName=' + this.postName, postData => {
      this.postMetadata = postData.metadata;
      this.postBody = this.converter.makeHtml(postData.body);
    });
  }
};

/**
  * component for map page
  */
let MapComponent = {
  template: `<div id='container'>
  MAP
</div>`
};

/**
  * component for about page
  */
let AboutComponent = {
  template: `<div id='container'>
  ABOUT
</div>`
};

/**
  * component for page not found
  */
let PageNotFoundComponent = {
  template: `<div id='container'>
  PAGE NOT FOUND
</div>`
}

/**
  * routing components
  */
let routes = [
  { regex: /^\/?$/, component: PostsComponent },
  { regex: /^\/posts\/?$/, component: PostsComponent },
  { regex: /^\/posts\/[a-z\-]+$/, component: PostComponent },
  { regex: /^\/map\/?$/, component: MapComponent },
  { regex: /^\/about\/?$/, component: AboutComponent }
];
let RouterComponent = {
  data() {
    return {
      activatedRoute: window.location.pathname.toLowerCase()
    };
  },
  computed: {
    ViewComponent() {
      for(let route of routes) {
        if(route.regex.test(this.activatedRoute)) {
          return route.component;
        }
      }
      return PageNotFoundComponent;
    }
  },
  render(createElement) {
    return createElement(this.ViewComponent);
  }
}

/**
  * set up base Vue app
  */
new Vue({
  el: '#app',
  data: {
    message: 'Hello, world!',
  },
  components: {
    'router': RouterComponent
  }
});
