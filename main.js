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
  * global constants
  */
const PAGETITLE = 'BaBaP';

/**
  * helper static components
  */
Vue.component('loading', {
  template: `<div class='cssload-container'>
  <!-- CSS whirlpool spinner (attribution in CSS) -->
  <div class='cssload-whirlpool'></div>
</div>`
})

/**
  * component for posts page (list)
  */
let PostsComponent = {
  template: `<div id='container'>
  <div id='search-sort-posts'>
    <input
      id='search-bar'
      v-model='searchTerm'
      placeholder='Search'>
    <button id='search-button' type='button'>Search</button>
    <span id='order-by-text'>Order by:</span>
    <select id='sort-select' v-model='postSort'>
      <option value='dateNewOld'>date (new-old)</option>
      <option value='dateOldNew'>date (old-new)</option>
      <option value='viewsMostLeast'>views (most-least)</option>
      <option value='alphaAZ'>alphabetical (A-Z)</option>
      <option value='alphaZA'>alphabetical (Z-A)</option>
    </select>
  </div>
  <loading v-if='posts.length == 0' />
  <div v-else>
    <a class='post-item noLink' v-for='post in postList' @click='$parent.changeRoute("/posts/" + post.path)'>
      <div class='post-id'>{{ post.id }}</div>
      <div class='post-info'>
        <h3 class='post-title'>{{ post.title }}</h3>
        <p class='post-description'>{{ post.description }}</p>
        <div class='post-path'>/posts/{{ post.path }}</div>
      </div>
    </a>
  </div>
</div>`,
  data() {
    return {
      posts: [],
      postSort: 'dateNewOld',
      searchTerm: ''
    };
  },
  computed: {
    postList() {
      switch(this.postSort) {
        case 'dateNewOld':
          return this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'dateOldNew':
          return this.posts.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'viewsMostLeast':
          return this.posts.sort((a, b) => b.hits - a.hits);
        case 'alphaAZ':
          return this.posts.sort((a, b) => a.title.localeCompare(b.title));
        case 'alphaZA':
          return this.posts.sort((a, b) => b.title.localeCompare(a.title));
      }
    }
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
  <loading v-if='postMetadata == null' />
  <div v-else-if='postMetadata.error'>
    <p>Error: {{ postMetadata.error  }}</p>
    <p><a @click='$parent.changeRoute("/posts")'>Return home.</a></p>
  </div>
  <div id='post-container' v-else>
    <h3 id='post-title'>{{ postMetadata.title }}</h3>
    <p id='post-description'>{{ postMetadata.description }}</p>
    <div id='post-date'>Published {{ postMetadata.date }}</div>
    <div id='post-body' v-html='postBody'></div>
    <div id='post-data'>
      Post views: {{ postMetadata.hits }}<br>
      Permalink: http://www.babap.co.nf/posts/{{ postMetadata.path }}
    </div>
    <p>
      <a @click='$parent.changeRoute("/posts")'>Return home.</a>
    </p>
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
      document.title = PAGETITLE + ' | ' + this.postMetadata.title;
      this.postBody = this.converter.makeHtml(postData.body);
    });
  }
};

/**
  * component for map page
  */
let MapComponent = {
  template: `<div id='container'>
  <h3>Map</h3>
  <p>Sorry, BaBaP's interactive map has not been implemented yet.</p>
</div>`
};

/**
  * component for about page
  */
let AboutComponent = {
  template: `<div id='container'>
  <div class='float-right'>
    <img src='/assets/portrait.jpg'>
    <figcaption>Here's an image. Your portrait could go here.</figcaption>
  </div>
  <h3>Meet the author!</h3>
  <p>JEssica lam! *magic fingers* *confetti* *lights* *action* (i dunno, you put stuff here)</p>
  <hr>
  <h3>About BaBaP</h3>
  <p>You're probably wondering, What is BaBaP? What does it stand for?</p>
  <p>And the answer is, Not much. Something along the lines of Bits and Bytes and Pieces. Or Bits and Bites and Pieces. Or Bits and Bites and Peaces. Think peace signs, computers (bits and bytes), or cakes (bites and pieces). But it can mean anything that fits the acronym. In other words, it's free-form, in a modern way.</p>
  <p>The main vision for BaBaP was to create an interactive experience. You can navigate this blog just as you navigate this world: walk around, enter homes or museums, talk to others. Perhaps you even take portals to your favorite exhibit, or to a random part of the world. Unfortunately, this part of BaBaP does not exist yet, in this very early stage.</p>
</div>`
};

/**
  * component for page not found
  */
let PageNotFoundComponent = {
  template: `<div id='container'>
  <h3>Sorry. This page has been destroyed (or never existed).</h3>
  <p>If you feel that this is a mistake, please contact the sitemaster (email address below).</p>
  <a @click='$parent.changeRoute("/posts")'>Return to the homepage?</a>
</div>`
}

/**
  * simple router
  * <p>
  * features:
  * - regex to match components
  * - page title when navigated
  * - ability to change route without reload (can be called from other components)
  * - save state in history for forward/back navigation
  */
let routes = [
  { regex: /^(\/posts)?\/?$/, component: PostsComponent, title: PAGETITLE, id: 0 },
  { regex: /^\/posts\/[a-z\-]+$/, component: PostComponent, title: PAGETITLE + ' | Post', id: -1 },
  { regex: /^\/map\/?$/, component: MapComponent, title: PAGETITLE + ' | Map', id: 1 },
  { regex: /^\/about\/?$/, component: AboutComponent, title: PAGETITLE + ' | About', id: 2 }
];
let RouterComponent = {
  data() {
    return {
      activatedRoute: window.location.pathname.toLowerCase(),
      changeRoute: function(newRoute) {
        this.activatedRoute = newRoute;
        history.pushState(this.activatedRoute, '', newRoute);
      }
    };
  },
  computed: {
    ViewComponent() {
      for(let route of routes) {
        if(route.regex.test(this.activatedRoute)) {
          document.title = route.title;
          this.$parent.activatedRoute = route.id;
          return route.component;
        }
      }
      document.title = PAGETITLE + ' | 404';
      this.$parent.activatedRoute = -1;
      return PageNotFoundComponent;
    }
  },
  render(createElement) {
    return createElement(this.ViewComponent);
  },
  created() {
    // allow the back button to work
    window.onpopstate = popStateData => {
      this.activatedRoute = popStateData.state;
    };
  }
}

/**
  * set up base Vue app
  */
new Vue({
  el: '#app',
  data: {
    message: 'Hello, world!',
    activatedRoute: -1
  },
  components: {
    'router': RouterComponent
  }
});
