import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardMedia,
  Box,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-lightbox/style.css';
import Lightbox from 'react-image-lightbox';

const BlogCard = ({ blog }) => {
  if (!blog || !blog.title) return null;

  const images = blog.images || [];
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index) => setPhotoIndex(index),
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2, borderRadius: '20px', boxShadow: 3, position: 'relative' }}>
      {images.length > 1 ? (
        <Box onClick={() => setIsOpen(true)} sx={{ cursor: 'pointer' }}>
          <Slider {...sliderSettings}>
            {images.map((img, index) => (
              <CardMedia
                key={index}
                component="img"
                height="200"
                image={img}
                alt={`Blog image ${index + 1}`}
                sx={{ objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://dummyimage.com/345x200/cccccc/000000&text=No+Image';
                }}
              />
            ))}
          </Slider>
        </Box>
      ) : (
        <CardMedia
          onClick={() => setIsOpen(true)}
          component="img"
          height="200"
          image={images[0] || 'https://dummyimage.com/345x200/cccccc/000000&text=No+Image'}
          alt="Blog image"
          sx={{ objectFit: 'cover', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', cursor: 'pointer' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://dummyimage.com/345x200/cccccc/000000&text=No+Image';
          }}
        />
      )}

      {images.length > 0 && (
        <Chip
          label={`${images.length} ${images.length === 1 ? 'Image' : 'Images'}`}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
          }}
        />
      )}

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

      {isOpen && images.length > 0 && (
        <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsOpen(false)}
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
