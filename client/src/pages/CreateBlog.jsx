import { useState } from 'react';
import { Card, CardContent, Typography, Button, CardMedia, Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const BlogCard = ({ blog }) => {
  if (!blog || !blog.title) return null;

  const images = blog.images || [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: index => setPhotoIndex(index),
  };

  const handleImageClick = (index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2, borderRadius: '20px', boxShadow: 3, position: 'relative' }}>
      {images.length > 1 ? (
        <Slider {...sliderSettings}>
          {images.map((img, index) => (
            <CardMedia
              key={index}
              component="img"
              height="200"
              image={img}
              alt={`Blog image ${index + 1}`}
              sx={{ objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', cursor: 'pointer' }}
              onClick={() => handleImageClick(index)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://dummyimage.com/345x200/cccccc/000000&text=No+Image';
              }}
            />
          ))}
        </Slider>
      ) : (
        <CardMedia
          component="img"
          height="200"
          image={images[0] || 'https://dummyimage.com/345x200/cccccc/000000&text=No+Image'}
          alt="Blog image"
          sx={{ objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', cursor: 'pointer' }}
          onClick={() => handleImageClick(0)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://dummyimage.com/345x200/cccccc/000000&text=No+Image';
          }}
        />
      )}

      {/* Image count */}
      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <Chip label={`${images.length} Image${images.length !== 1 ? 's' : ''}`} size="small" color="primary" />
      </Box>

      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {blog.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {blog.content?.slice(0, 100) + '...'}
        </Typography>
        <Button
          component={Link}
          to={`/blogs/${blog.id}`}
          variant="contained"
          size="small"
        >
          Read More
        </Button>
      </CardContent>

      {lightboxOpen && (
        <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setLightboxOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + images.length - 1) % images.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % images.length)
          }
        />
      )}
    </Card>
  );
};

export default BlogCard;
