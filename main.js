/**
  * Util helper functions:
  * - mixed get(string url, boolean json=true)
  */
function get(url, callback, json = true) {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      try {
        callback(json ? JSON.parse(this.responseText) : this.responseText);
      } catch(e) {
        console.log('ERROR WITH FOLLOWING JSON: ' + this.responseText);
      }
    }
  };
  req.open('GET', url, true);
  req.send();
}

/**
  * component for posts page
  */
let PostsComponent = {
  template: `<div id='container'>
  <div v-if='posts.length == 0'>Loading&hellip;</div>
  <div v-else>
    <div class='post-item' v-for='post in posts'>
      <div>Title: {{ post.title }}</div>
      <div>Post id: {{ post.id }}</div>
      <div>Description: {{ post.description }}</div>
      <div>Path: {{ post.path }}</div>
      <div>Path: {{ post.hits }}</div>
    </div>
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
let routes = {
  '/': PostsComponent,
  '/posts': PostsComponent,
  '/map': MapComponent,
  '/about': AboutComponent
};
let RouterComponent = {
  data() {
    return {
      activatedRoute: window.location.pathname.toLowerCase().replace(/\/$/, '')
    };
  },
  computed: {
    ViewComponent() {
      return routes[this.activatedRoute] || PageNotFoundComponent;
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
