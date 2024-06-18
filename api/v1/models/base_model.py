class BaseModel():

    """Represent a base class of all models"""

    def __init__(self, **kwargs):
        """Instantiate an instance of the class"""

        if kwargs:
            for key, value in kwargs.items():
                if key in ['joined_at', 'updated_at']:
                    continue
                if key in self.__class__.__dict__:
                    setattr(self, key, value)

    def to_dict(self):
        """returns a dictionary containing all keys/values of the instance"""
        new_dict = {}
        for attr in vars(self.__class__):
            if (attr.startswith('_')) or attr == 'to_dict'\
                or attr == "id" or attr == "password":
                continue

            new_dict[attr] = getattr(self, attr)

        if "joined_at" in new_dict:
            new_dict["joined_at"] = new_dict["joined_at"].strftime('%Y-%m-%d %H:%M:%S')
        if "updated_at" in new_dict:
            new_dict["updated_at"] = new_dict["updated_at"].strftime('%Y-%m-%d %H:%M:%S')

        return new_dict
