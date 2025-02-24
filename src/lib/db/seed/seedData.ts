import type { User } from '../Schema'

type SeedUser = Omit<User, 'password' | 'emailVerified' | 'googleId'>

export const seedData = {
  users: [
    {
      id: '01HQ5GMWX0000000000000000',
      name: 'Amara Nwosu',
      username: 'amara_nwosu',
      email: 'amara@perf.engineering',
      bio: 'Web performance engineer focused on optimizing load times and reducing JavaScript bloat.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740252932/threads-clone/avatars/1481968f.png',
      followerCount: 3,
    },
    {
      id: '01HQ5GMWX1000000000000000',
      name: 'Elias Berg',
      username: 'framework_skeptic',
      email: 'elias@vanillajs.dev',
      bio: 'JavaScript purist | Framework-free development advocate | Web Components enthusiast',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740252966/threads-clone/avatars/145514b7.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWX2000000000000000',
      name: 'Yuki Tanaka',
      username: 'yuki_tanaka',
      email: 'yuki@wasm.tech',
      bio: 'Rust & WebAssembly developer | SIMD optimization specialist',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740252983/threads-clone/avatars/143a3af7.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWX3000000000000000',
      name: 'Marco Silva',
      username: 'marcosilva',
      email: 'marco@stricttypes.io',
      bio: 'Software engineer specializing in TypeScript, static typing, and scalable application architectures.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253206/threads-clone/avatars/144a5253.png',
      followerCount: 0,
    },
    {
      id: '01HQ5GMWX4000000000000000',
      name: 'Fatima Al-Mutawa',
      username: 'legacycode',
      email: 'fatima@enterprise.web',
      bio: 'Enterprise software developer maintaining and modernizing large-scale Angular applications. Based in Nashville.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253228/threads-clone/avatars/14676dd5.png',
      followerCount: 0,
    },
    {
      id: '01HQ5GMWXC000000000000000',
      name: 'Linh Nguyen',
      username: 'linh_nguyen',
      email: 'linh@nextgpt.dev',
      bio: 'ML engineer bridging AI and web development | TensorFlow.js expert | Creating smart browser extensions',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253235/threads-clone/avatars/14742c1a.png',
      followerCount: 2,
    },
    {
      id: '01HQ5GMWXD000000000000000',
      name: 'Carlos Mendez',
      username: 'carlosmendez',
      email: 'carlos@perfnode.com',
      bio: 'Backend engineer specializing in Node.js performance, scalability, and memory management.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253243/threads-clone/avatars/1481b950.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWXE000000000000000',
      name: 'Sophie Kim',
      username: 'a11y_advocate',
      email: 'sophie@inclusive.design',
      bio: 'Web accessibility specialist | WCAG consultant',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253251/threads-clone/avatars/148eef79.png',
      followerCount: 3,
    },
    {
      id: '01HQ5GMWXF000000000000000',
      name: 'Omar Farooq',
      username: 'omarfarooq22',
      email: 'omar@aiweb.dev',
      bio: 'Software engineer building AI-powered web applications and intelligent content management systems.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253259/threads-clone/avatars/14922d51.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWXG000000000000000',
      name: 'Natalia Ivanova',
      username: 'natalianova',
      email: 'natalia@webgl.pro',
      bio: '3D graphics developer specializing in WebGL, GPU acceleration, and real-time rendering.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253267/threads-clone/avatars/149f50b6.png',
      followerCount: 0,
    },
    {
      id: '01HQ5GMWXH000000000000000',
      name: 'Rajesh Kapoor',
      username: 'rajesh_k',
      email: 'rajesh@tsclinic.dev',
      bio: 'TypeScript migration specialist. DefinitelyTyped contributor',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253276/threads-clone/avatars/14ad516c.png',
      followerCount: 2,
    },
    {
      id: '01HQ5GMWXI000000000000000',
      name: 'Sarah Chen',
      username: 'sarahchen',
      email: 'sarah@memprof.dev',
      bio: 'Software engineer specializing in performance profiling, memory optimization, and debugging.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253285/threads-clone/avatars/14bb0aba.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWXJ000000000000000',
      name: 'David Kim',
      username: 'david_deno',
      email: 'david@denoland.dev',
      bio: 'Deno core contributor. Web platform standards advocate.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253294/threads-clone/avatars/14c84502.png',
      followerCount: 0,
    },
    {
      id: '01HQ5GMWXK000000000000000',
      name: 'Maya Patel',
      username: 'mayapatel',
      email: 'maya@webperf.dev',
      bio: 'Performance optimization specialist | Core Web Vitals expert',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253305/threads-clone/avatars/15ff1c2a.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWXL000000000000000',
      name: 'Thomas Wagner',
      username: 'thomaswagner',
      email: 'thomas@csswizard.dev',
      bio: 'Design systems consultant based in Berlin.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253313/threads-clone/avatars/160c4bad.png',
      followerCount: 2,
    },
    {
      id: '01HQ5GMWXM000000000000000',
      name: 'Kofi Mensah',
      username: 'kofimensah',
      email: 'kofi@crossplatform.dev',
      bio: 'Frontend engineer with expertise in React Native, monorepo tooling, and cross-platform development.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253321/threads-clone/avatars/161975d4.png',
      followerCount: 2,
    },
    {
      id: '01HQ5GMWXN000000000000000',
      name: 'Lei Zhang',
      username: 'zhang_dweb',
      email: 'lei@dweb.tools',
      bio: 'Decentralized web protocols engineer working on IPFS, distributed systems, and peer-to-peer applications.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253330/threads-clone/avatars/161d3026.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWXO000000000000000',
      name: 'Anika Patel',
      username: 'testing_evangelist',
      email: 'anika@vitest.dev',
      bio: 'Testing pyramid advocate',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253338/threads-clone/avatars/162a574c.png',
      followerCount: 2,
    },
    {
      id: '01HQ5GMWXP000000000000000',
      name: 'Nadia Petrov',
      username: 'nadia_petrov',
      email: 'nadia@webasm.io',
      bio: 'WebAssembly runtime specialist. University of California, San Diego.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253346/threads-clone/avatars/1637e7ac.png',
      followerCount: 0,
    },
    {
      id: '01HQ5GMWXQ000000000000000',
      name: 'Everett Winslow',
      username: 'everett_is',
      email: 'everett@ng-enterprise.io',
      bio: 'Enterprise Angular developer specializing in monorepos, Nx workspaces, and module federation.',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740253356/threads-clone/avatars/1645a14d.png',
      followerCount: 1,
    },
    {
      id: '01HQ5GMWYR000000000000000',
      name: 'Elena Rodriguez',
      username: 'elena_webgl',
      email: 'elena@webgl.dev',
      bio: 'WebGL performance specialist',
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740209528/threads-clone/avatars/389b973e.png',
      followerCount: 1,
    },
  ] satisfies SeedUser[],

  posts: [
    {
      id: '01HQ5GMWXB000000000000000',
      text: 'Web Components adoption blockers:\n1. Scoped styles break utility-first CSS\n2. Poor TypeScript support\n3. SSR hydration complexity\n4. State management gaps\n\nUntil these are solved, framework dominance will continue.',
      userId: '01HQ5GMWX0000000000000000',
      parentId: null,
      createdAt: 1739998432,
      image: null,
      likeCount: 2,
      repostCount: 0,
      replyCount: 0,
      shareCount: 2,
    },
    {
      id: '01HQ5GMWYJ000000000000000',
      text: "Been getting back into night photography. Here's one from Joshua Tree last weekend.",
      userId: '01HQ5GMWXO000000000000000',
      parentId: null,
      createdAt: 1739972432,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740176441/threads-clone/content/r2zn9jpilr8a2cj4dery.png',
      imageWidth: 1376,
      imageHeight: 768,
      likeCount: 4,
      repostCount: 0,
      replyCount: 1,
      shareCount: 4,
    },
    {
      id: '01HQ5GMWYK000000000000000',
      text: 'This is awesome!',
      userId: '01HQ5GMWXI000000000000000',
      parentId: '01HQ5GMWYJ000000000000000',
      createdAt: 1739998432,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWY4000000000000000',
      text: 'Just discovered a memory leak in our Node.js WebSocket server - 2GB/hr! Any debugging tips?',
      userId: '01HQ5GMWXK000000000000000',
      parentId: null,
      createdAt: 1739970032,
      image: null,
      likeCount: 2,
      repostCount: 1,
      replyCount: 2,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWY9000000000000000',
      text: 'Use heap snapshots and track event emitter listeners. Leaks often come from forgotten listeners.',
      userId: '01HQ5GMWXI000000000000000',
      parentId: '01HQ5GMWY4000000000000000',
      createdAt: 1739975332,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 1,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYM000000000000000',
      text: 'Thank you!',
      userId: '01HQ5GMWXK000000000000000',
      parentId: '01HQ5GMWY9000000000000000',
      createdAt: 1739976332,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYE000000000000000',
      text: 'Also check for dangling timers and intervals. setTimeout is a common culprit.',
      userId: '01HQ5GMWXF000000000000000',
      parentId: '01HQ5GMWY4000000000000000',
      createdAt: 1739979632,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWY0000000000000000',
      text: 'The case for gradual TypeScript adoption: Migrated 10k LOC in 3 weeks using ts-migrate',
      userId: '01HQ5GMWXH000000000000000',
      parentId: null,
      createdAt: 1739962432,
      image: null,
      likeCount: 3,
      repostCount: 2,
      replyCount: 0,
      shareCount: 2,
    },
    {
      id: '01HQ5GMWX8000000000000000',
      text: "TypeScript anti-pattern: Stop using 'any' as escape hatch. Even in type emergencies:\n1. Use @ts-expect-error with comments\n2. Create branded types\n3. Leverage 'unknown' with type guards\n\nYour future self will thank you.",
      userId: '01HQ5GMWX3000000000000000',
      parentId: null,
      createdAt: 1739962032,
      image: null,
      likeCount: 1,
      repostCount: 1,
      replyCount: 1,
      shareCount: 2,
    },
    {
      id: '01HQ5GMWX9000000000000000',
      text: "While I agree in theory, enterprise environments with legacy code often require pragmatism. Our 500k LOC Angular app still has 1,200+ anys - refactoring them all would take years. Where's the middle ground?",
      userId: '01HQ5GMWX4000000000000000',
      parentId: '01HQ5GMWX8000000000000000',
      createdAt: 1739962332,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWXA000000000000000',
      text: 'Good morning',
      userId: '01HQ5GMWXL000000000000000',
      parentId: null,
      createdAt: 1739961932,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740177412/threads-clone/content/mwvcou3qlopxbqo7vghh.png',
      imageWidth: 1376,
      imageHeight: 768,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWXY000000000000000',
      text: 'Vite 5 migration pain points: 12% slower HMR in large monorepos. Anyone else seeing this?',
      userId: '01HQ5GMWXQ000000000000000',
      parentId: null,
      createdAt: 1739961632,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWXX000000000000000',
      text: 'Browser storage limits 2024: localStorage vs IndexedDB vs Cache API',
      userId: '01HQ5GMWXE000000000000000',
      parentId: null,
      createdAt: 1739961232,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740175503/threads-clone/content/gttpimplv7ddxcstgocg.png',
      imageWidth: 976,
      imageHeight: 1000,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWXW000000000000000',
      text: 'WebSocket compression benchmarks: how does msgpack, protobuf and JSON compare in 2024?',
      userId: '01HQ5GMWXD000000000000000',
      parentId: null,
      createdAt: 1739960832,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 2,
    },
    {
      id: '01HQ5GMWXV000000000000000',
      text: 'The hidden cost of micro-frontends: Our bundle analysis shows 23% duplicated dependencies across fragments',
      userId: '01HQ5GMWXE000000000000000',
      parentId: null,
      createdAt: 1739960432,
      image: null,
      likeCount: 1,
      repostCount: 1,
      replyCount: 0,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWY7000000000000000',
      text: 'WebGL 2.0 particle system rendering 100k particles at 60fps - breakthrough!',
      userId: '01HQ5GMWYR000000000000000',
      parentId: null,
      createdAt: 1739960200,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740294914/threads-clone/content/czenafom2pzpkxhrcptp.jpg',
      imageWidth: 1024,
      imageHeight: 1024,
      likeCount: 5,
      repostCount: 3,
      replyCount: 0,
      shareCount: 4,
    },
    {
      id: '01HQ5GMWXU000000000000000',
      text: 'CSS :has() selector adoption reaches 92% global coverage. Time to ditch the old polyfills?',
      userId: '01HQ5GMWX1000000000000000',
      parentId: null,
      createdAt: 1739960032,
      image: null,
      likeCount: 0,
      repostCount: 1,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01JQ5GMWYR000000000000000',
      text: 'Working from home ❤️',
      userId: '01HQ5GMWXG000000000000000',
      parentId: null,
      createdAt: 1739960200,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740296616/threads-clone/content/alnwmg5wx72z7wukafw9.webp',
      imageWidth: 1200,
      imageHeight: 655,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWXT000000000000000',
      text: 'Implementing real-time collaborative editing with CRDTs in React - 6x more efficient than OT!',
      userId: '01HQ5GMWXC000000000000000',
      parentId: null,
      createdAt: 1739959632,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740175708/threads-clone/content/lnvzpvasbt7ksj3sqlgy.png',
      imageWidth: 1685,
      imageHeight: 1132,
      likeCount: 3,
      repostCount: 2,
      replyCount: 0,
      shareCount: 3,
    },
    {
      id: '01HQ5GMWXS000000000000000',
      text: 'Modern CSS is Turing-complete. With calc(), CSS functions, and @property, we can now implement complex algorithms directly in CSS.',
      userId: '01HQ5GMWX1000000000000000',
      parentId: null,
      createdAt: 1739958032,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWYL000000000000000',
      text: "Deep dive: Implementing efficient text layout in WebAssembly. Got Rust+Wasm layout engine performing 2.8x faster than browser's native layout engine. Main challenges:\n- Font shaping complexity\n- GPU texture management\n- Browser security constraints\n\nCode samples on GitHub",
      userId: '01HQ5GMWX2000000000000000',
      parentId: null,
      createdAt: 1739956432,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWY8000000000000000',
      text: 'Our TypeScript migration uncovered 200+ potential bugs in legacy JavaScript code. ROI justified!',
      userId: '01HQ5GMWXH000000000000000',
      parentId: null,
      createdAt: 1739955232,
      image: null,
      likeCount: 2,
      repostCount: 1,
      replyCount: 2,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWYD000000000000000',
      text: 'How did you calculate ROI? Management needs convincing.',
      userId: '01HQ5GMWX4000000000000000',
      parentId: '01HQ5GMWY8000000000000000',
      createdAt: 1739955532,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYI000000000000000',
      text: 'Calculated time saved debugging vs migration costs. 3:1 ROI in first year!',
      userId: '01HQ5GMWXH000000000000000',
      parentId: '01HQ5GMWY8000000000000000',
      createdAt: 1739955832,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWY6000000000000000',
      text: "Migrating from Redux to Zustand reduced our store code by 60%. Why didn't we do this sooner?",
      userId: '01HQ5GMWXM000000000000000',
      parentId: null,
      createdAt: 1739952432,
      image: null,
      likeCount: 3,
      repostCount: 1,
      replyCount: 2,
      shareCount: 2,
    },
    {
      id: '01HQ5GMWYB000000000000000',
      text: "Zustand's simplicity is great until you need middleware. How did you handle analytics?",
      userId: '01HQ5GMWXQ000000000000000',
      parentId: '01HQ5GMWY6000000000000000',
      createdAt: 1739952732,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYG000000000000000',
      text: 'We used middleware chains for analytics and logging. Docs here: https://docs.example.com',
      userId: '01HQ5GMWXM000000000000000',
      parentId: '01HQ5GMWY6000000000000000',
      createdAt: 1739953032,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWY5000000000000000',
      text: 'CSS Container Queries finally make responsive components manageable! Created a cheat sheet that I can refer back to.',
      userId: '01HQ5GMWXL000000000000000',
      parentId: null,
      createdAt: 1739951232,
      image: null,
      likeCount: 4,
      repostCount: 2,
      replyCount: 2,
      shareCount: 3,
    },
    {
      id: '01HQ5GMWYA000000000000000',
      text: 'Could you share the cheat sheet? Struggling with aspect-ratio containers.',
      userId: '01HQ5GMWX0000000000000000',
      parentId: '01HQ5GMWY5000000000000000',
      createdAt: 1739951532,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYF000000000000000',
      text: 'Here is the cheat sheet Gist link: https://gist.github.com/amaranwosu/1234567890 Let me know if you need examples!',
      userId: '01HQ5GMWXL000000000000000',
      parentId: '01HQ5GMWY5000000000000000',
      createdAt: 1739951832,
      image: null,
      likeCount: 2,
      repostCount: 1,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYH000000000000000',
      text: "Deno 2.0's new npm compatibility layer - finally production ready or just chasing Node's tail?",
      userId: '01HQ5GMWXD000000000000000',
      parentId: null,
      createdAt: 1739949432,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 1,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWXZ000000000000000',
      text: 'Just compiled SQLite to WASM. Now it runs everywhere. Edge, browser, fridge... you name it.',
      userId: '01HQ5GMWXP000000000000000',
      parentId: null,
      createdAt: 1739949639,
      image:
        'https://res.cloudinary.com/dsrekt1mo/image/upload/v1740174664/threads-clone/content/nj3h1trdyqocfgqdkrjl.png',
      imageWidth: 2696,
      imageHeight: 1593,
      likeCount: 2,
      repostCount: 1,
      replyCount: 0,
      shareCount: 1,
    },
    {
      id: '01HQ5GMWY3000000000000000',
      text: "Deno's approach to npm is fundamentally flawed. They should focus on their own module system.",
      userId: '01HQ5GMWXJ000000000000000',
      parentId: '01HQ5GMWYH000000000000000',
      createdAt: 1739949732,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWXR000000000000000',
      text: 'React Server Components in production: Cut our hydration time by 40% but doubled build complexity. Worth it?',
      userId: '01HQ5GMWXI000000000000000',
      parentId: null,
      createdAt: 1739947932,
      image: null,
      likeCount: 2,
      repostCount: 1,
      replyCount: 2,
      shareCount: 2,
    },
    {
      id: '01HQ5GMWY1000000000000000',
      text: "The build complexity comes from RSC's dual runtime requirements. We mitigated this with a custom Next.js plugin.",
      userId: '01HQ5GMWXM000000000000000',
      parentId: '01HQ5GMWXR000000000000000',
      createdAt: 1739948232,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWY2000000000000000',
      text: 'Still not worth it IMO. The DX tax is too high for marginal perf gains.',
      userId: '01HQ5GMWX1000000000000000',
      parentId: '01HQ5GMWXR000000000000000',
      createdAt: 1739948532,
      image: null,
      likeCount: 1,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
    {
      id: '01HQ5GMWYO000000000000000',
      text: "The modern web's dependency problem: Just audited a 'simple' React app - 1,284 dependencies including 14 different date formatting libraries. When did we decide this was acceptable?",
      userId: '01HQ5GMWX0000000000000000',
      parentId: null,
      createdAt: 1739947332,
      image: null,
      likeCount: 1,
      repostCount: 1,
      replyCount: 1,
      shareCount: 3,
    },
    {
      id: '01HQ5GMWYP000000000000000',
      text: "It's not just React. Even simple Vue apps pull in 400+ deps by default. The node_modules black hole is consuming us all. When will framework authors prioritize bundle size?",
      userId: '01HQ5GMWX1000000000000000',
      parentId: '01HQ5GMWYO000000000000000',
      createdAt: 1739947632,
      image: null,
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      shareCount: 0,
    },
  ],

  likes: [
    {
      userId: '01HQ5GMWX2000000000000000',
      postId: '01HQ5GMWXB000000000000000',
      createdAt: 1739998532,
    },
    {
      userId: '01HQ5GMWX3000000000000000',
      postId: '01HQ5GMWXB000000000000000',
      createdAt: 1739998632,
    },
    {
      userId: '01HQ5GMWX0000000000000000',
      postId: '01HQ5GMWXA000000000000000',
      createdAt: 1739958132,
    },
    {
      userId: '01HQ5GMWX3000000000000000',
      postId: '01HQ5GMWXR000000000000000',
      createdAt: 1739948232,
    },
    {
      userId: '01HQ5GMWX4000000000000000',
      postId: '01HQ5GMWXS000000000000000',
      createdAt: 1739949732,
    },
    {
      userId: '01HQ5GMWXC000000000000000',
      postId: '01HQ5GMWXT000000000000000',
      createdAt: 1739959732,
    },
    {
      userId: '01HQ5GMWXK000000000000000',
      postId: '01HQ5GMWY4000000000000000',
      createdAt: 1739950332,
    },
    {
      userId: '01HQ5GMWXL000000000000000',
      postId: '01HQ5GMWY5000000000000000',
      createdAt: 1739951832,
    },
    {
      userId: '01HQ5GMWXM000000000000000',
      postId: '01HQ5GMWY6000000000000000',
      createdAt: 1739952732,
    },
    {
      userId: '01HQ5GMWXQ000000000000000',
      postId: '01HQ5GMWY8000000000000000',
      createdAt: 1739945532,
    },
    {
      userId: '01HQ5GMWX1000000000000000',
      postId: '01HQ5GMWYJ000000000000000',
      createdAt: 1739972532,
    },
    {
      userId: '01HQ5GMWX2000000000000000',
      postId: '01HQ5GMWYJ000000000000000',
      createdAt: 1739972632,
    },
    {
      userId: '01HQ5GMWX3000000000000000',
      postId: '01HQ5GMWYJ000000000000000',
      createdAt: 1739972732,
    },
    {
      userId: '01HQ5GMWX4000000000000000',
      postId: '01HQ5GMWYJ000000000000000',
      createdAt: 1739972832,
    },
    {
      userId: '01HQ5GMWXC000000000000000',
      postId: '01HQ5GMWX8000000000000000',
      createdAt: 1739962132,
    },
    {
      userId: '01HQ5GMWXD000000000000000',
      postId: '01HQ5GMWXV000000000000000',
      createdAt: 1739960532,
    },
    {
      userId: '01HQ5GMWXF000000000000000',
      postId: '01HQ5GMWXW000000000000000',
      createdAt: 1739960932,
    },
    {
      userId: '01HQ5GMWXG000000000000000',
      postId: '01HQ5GMWXY000000000000000',
      createdAt: 1739961732,
    },
  ],

  reposts: [
    {
      userId: '01HQ5GMWX4000000000000000',
      postId: '01HQ5GMWYO000000000000000',
      createdAt: 1739947932,
    },
    {
      userId: '01HQ5GMWX2000000000000000',
      postId: '01HQ5GMWXR000000000000000',
      createdAt: 1739948232,
    },
    {
      userId: '01HQ5GMWXE000000000000000',
      postId: '01HQ5GMWXV000000000000000',
      createdAt: 1739960532,
    },
    {
      userId: '01HQ5GMWXI000000000000000',
      postId: '01HQ5GMWY5000000000000000',
      createdAt: 1739951832,
    },
    {
      userId: '01HQ5GMWXJ000000000000000',
      postId: '01HQ5GMWY7000000000000000',
      createdAt: 1739954932,
    },
    {
      userId: '01HQ5GMWXE000000000000000',
      postId: '01HQ5GMWX8000000000000000',
      createdAt: 1739962232,
    },
    {
      userId: '01HQ5GMWXK000000000000000',
      postId: '01HQ5GMWY7000000000000000',
      createdAt: 1739954232,
    },
    {
      userId: '01HQ5GMWXL000000000000000',
      postId: '01HQ5GMWY7000000000000000',
      createdAt: 1739954432,
    },
    {
      userId: '01HQ5GMWXM000000000000000',
      postId: '01HQ5GMWY7000000000000000',
      createdAt: 1739954632,
    },
  ],

  followers: [
    {
      followerId: '01HQ5GMWX1000000000000000',
      userId: '01HQ5GMWX0000000000000000',
      createdAt: 1739945232,
    },
    {
      followerId: '01HQ5GMWX2000000000000000',
      userId: '01HQ5GMWX0000000000000000',
      createdAt: 1739945532,
    },
    {
      followerId: '01HQ5GMWX0000000000000000',
      userId: '01HQ5GMWX1000000000000000',
      createdAt: 1739945832,
    },
    {
      followerId: '01HQ5GMWXC000000000000000',
      userId: '01HQ5GMWX2000000000000000',
      createdAt: 1739946132,
    },
    {
      followerId: '01HQ5GMWXD000000000000000',
      userId: '01HQ5GMWX0000000000000000',
      createdAt: 1739946432,
    },
    {
      followerId: '01HQ5GMWXE000000000000000',
      userId: '01HQ5GMWXL000000000000000',
      createdAt: 1739946732,
    },
    {
      followerId: '01HQ5GMWXF000000000000000',
      userId: '01HQ5GMWXM000000000000000',
      createdAt: 1739947032,
    },
  ],
}
