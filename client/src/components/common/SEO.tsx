import React, { useEffect } from 'react';
import { updateDocumentSeo, SeoProps } from '../../utils/seo';

export const SEO: React.FC<SeoProps> = (props) => {
  useEffect(() => {
    updateDocumentSeo(props);
  }, [props.title, props.description, props.keywords, props.image, props.url]);

  return null;
};
