import React, { useState, useRef } from 'react';
// import Redis from 'ioredis';



async function doit() {
  // Set a value in Redis
  // await redis.set('user:chat:ShinyDialga45', JSON.stringify({
  //   score: 'r',
  //   member: 'e',
  // }));

  // // Get a value from Redis
  // const me = await redis.get('user:chat:ShinyDialga45');
  // console.log('Value from Redis:', JSON.parse(me));
}

export default function AvatarUploadPage() {
  const inputFileRef = useRef(null);
  const [blob, setBlob] = useState(null);

  return (
    <>
      <h1>Upload Your Avatar</h1>

      <form onSubmit={(event) => {
        event.preventDefault();

        // Call the `doit` function to interact with Redis
        doit();
      }}>
        <input name="file" ref={inputFileRef} type="file" required />
        <button type="submit">Upload</button>
      </form>

      {blob && (
        <div>
          Blob url:
          {' '}
          <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  )
      }
// import { upload, put } from '@vercel/blob/client';
// import React, { useState, useRef } from 'react';
// import { createClient, kv } from '@vercel/kv';

// 'use client';
// async function doit() {
    
//     const products = createClient({

//       await kv.set('user:chat:ShinyDialga45', {
//         score: 'r',
//         member: 'e',
//       });
//     const me = await kv.get('user:chat:ShinyDialga45');

// }
// export default function AvatarUploadPage() {
//   const inputFileRef = useRef(null);
//   const [blob, setBlob] = useState(null);
//   return (
//     <>
//       <h1>Upload Your Aevatar</h1>

//       <form
//         onSubmit={async (event) => {
//             await kv.set('user:chat:ShinyDialga45', {
//                 score: 'r',
//                 member: 'e',
//               });
//             const me = await kv.get('user:chat:ShinyDialga45');
//             console.log(me);
//         //   event.preventDefault();

//         //   const file = inputFileRef.current.files[0];

//         //   console.log("uploading")
//         //   const newBlob = await put(file.name, file, { access: 'public', token: "" });

//         // //   const newBlob = await upload(file.name, file, {
//         // //     access: 'public',
//         // //     handleUploadUrl: '/api/avatar/upload',
//         // //     token: ""
//         // //   });

//         //   setBlob(newBlob);
//         }}
//       >
//         <input name="file" ref={inputFileRef} type="file" required />
//         <button onClick={doit()}>Upload</button>
//       </form>
//       {blob && (
//         <div>
//           Blob url:
//           {' '}
//           <a href={blob.url}>{blob.url}</a>
//         </div>
//       )}
//     </>
//   );
// }
