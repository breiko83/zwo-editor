import React from "react";
import { Helmet } from "react-helmet";

interface HeadProps {
  id: string;
  name: string;
  description: string;
}

const Head = ({ id, name, description }: HeadProps) => (
  <Helmet>
    <title>{name ? `${name} - Zwift Workout Editor` : "My Workout - Zwift Workout Editor"}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={name ? `${name} - Zwift Workout Editor` : "My Workout - Zwift Workout Editor"} />
    <meta property="og:description" content={description} />
    <link rel="canonical" href={`https://www.zwiftworkout.com/editor/${id}`} />
    <meta property="og:url" content={`https://www.zwiftworkout.com/editor/${id}`} />
  </Helmet>
);

export default Head;
